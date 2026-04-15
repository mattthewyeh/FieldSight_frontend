import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Battery, Radio, Loader2, ShieldAlert, PenTool, Play, Square, Clock, CheckCircle2, XCircle, MapPin, Navigation, Eye } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const VITE_API_URL = import.meta.env.VITE_API_URL || "https://api.fieldsightproject.com";

export default function Dashboard({ onLogout, farmCoords }) {
  const FARMER_ID = 1; 
  const ROVER_ID = 1; 

  const mapContainer = useRef(null);
  const map = useRef(null);
  const roverMarker = useRef(null);
  const resultMarkers = useRef(new Map()); 
  
  const telemetryWS = useRef(null);
  const scansWS = useRef(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [currentCoords, setCurrentCoords] = useState(farmCoords || { lng: -121.88107, lat: 37.33332 });
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState([]);
  const [error, setError] = useState(null);
  const [battery, setBattery] = useState(100);
  const [lastUpdate, setLastUpdate] = useState("Never");
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('offline');
  
  const [liveTelemetry, setLiveTelemetry] = useState({ lat: 0, lng: 0, speed: 0 });
  const [scanCount, setScanCount] = useState(0);

  // --- NEW STATES FOR SCAN FLOW ---
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scanDataBuffer, setScanDataBuffer] = useState([]); 

  const theme = {
    sageGreen: '#A3B18A',
    darkBrown: '#3E2723',
    severity: { early: '#FFD700', moderate: '#FF8C00', critical: '#FF0000' }
  };

  const connectWebSockets = (sessionId) => {
    const wsBase = VITE_API_URL.replace("https://", "wss://").replace("http://", "ws://");
    setConnectionStatus('connecting');

    telemetryWS.current = new WebSocket(`${wsBase}/websocket/telemetry/${ROVER_ID}`);
    
    telemetryWS.current.onopen = () => {
      setConnectionStatus('success');
      setError(null);
    };

    telemetryWS.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "telemetry.latest") {
        const { gps_lng, gps_lat, battery_level, captured_at, speed } = data.telemetry;
        updateRoverMarker([gps_lng, gps_lat]);
        setBattery(battery_level);
        setLiveTelemetry({ lat: gps_lat, lng: gps_lng, speed: speed || 0 });
        setLastUpdate(new Date(captured_at).toLocaleTimeString());
      }
    };

    scansWS.current = new WebSocket(`${wsBase}/websocket/scans/${sessionId}`);
    scansWS.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "scan.stored") {
        // Buffer the data instead of adding markers immediately
        setScanDataBuffer(prev => [...prev, data.scan]);
        setScanCount(prev => prev + 1);
      }
    };

    telemetryWS.current.onerror = () => {
      setError("Backend connection failed.");
      setConnectionStatus('error');
    };

    telemetryWS.current.onclose = () => {
      setConnectionStatus(isScanning ? 'error' : 'offline');
    };
  };

  const disconnectWebSockets = () => {
    if (telemetryWS.current) telemetryWS.current.close();
    if (scansWS.current) scansWS.current.close();
    setConnectionStatus('offline');
  };

  const updateRoverMarker = (pos) => {
    if (!map.current) return;
    if (!roverMarker.current) {
      const el = document.createElement('div');
      el.innerHTML = `<span style="font-size: 30px; filter: drop-shadow(0 0 5px white);">🚜</span>`;
      roverMarker.current = new mapboxgl.Marker(el).setLngLat(pos).addTo(map.current);
    } else {
      roverMarker.current.setLngLat(pos);
    }
    map.current.easeTo({ center: pos, duration: 500 });
  };

  // --- REVEAL SCAN RESULTS ---
  const handleRevealResults = () => {
    setShowResults(true);
    scanDataBuffer.forEach(scan => {
      if (resultMarkers.current.has(scan.scan_id)) return;
      const color = theme.severity[scan.disease_status.toLowerCase()] || '#ccc';
      const marker = new mapboxgl.Marker({ color })
        .setLngLat([scan.gps_lng, scan.gps_lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="color: black; padding: 5px; font-family: sans-serif;">
            <img src="${scan.image_url}" style="width:100%; border-radius:4px; margin-bottom:5px;"/>
            <b style="text-transform: uppercase;">${scan.disease_status}</b><br/>
            Confidence: ${(scan.confidence_score * 100).toFixed(1)}%
          </div>
        `))
        .addTo(map.current);
      resultMarkers.current.set(scan.scan_id, marker);
    });

    if (scanDataBuffer.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      scanDataBuffer.forEach(s => bounds.extend([s.gps_lng, s.gps_lat]));
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  // --- UPDATED MAP INIT (STRICT MODE SAFE) ---
  useEffect(() => {
    if (map.current) return; 
    if (!MAPBOX_TOKEN || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [currentCoords.lng, currentCoords.lat],
      zoom: 18,
      attributionControl: false 
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      console.log("🚀 Mapbox fully loaded and ready");

      if (!map.current.getSource('route')) {
        map.current.addSource('route', { 
          type: 'geojson', 
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } 
        });
        map.current.addLayer({ 
          id: 'route', 
          type: 'line', 
          source: 'route', 
          paint: { 'line-color': '#A5D6A7', 'line-width': 4, 'line-dasharray': [2, 1] } 
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); 

  useEffect(() => {
    if (!map.current) return;
    const handleMapClick = (e) => {
      if (!isDrawing) return;
      const newPoint = [e.lngLat.lng, e.lngLat.lat];
      setDrawPath((prev) => {
        const updated = [...prev, newPoint];
        const source = map.current.getSource('route');
        if (source) {
          source.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: updated } });
        }
        return updated;
      });
    };
    map.current.on('click', handleMapClick);
    return () => map.current?.off('click', handleMapClick);
  }, [isDrawing]);

  const startFollowPath = async () => {
    if (drawPath.length < 2) return setError("Please draw a path first.");
    const token = localStorage.getItem("token");
    try {
      setIsScanning(true);
      setError(null);
      setScanCount(0);
      setScanDataBuffer([]); // Clear previous scan data
      setShowResults(false);
      const response = await fetch(`${VITE_API_URL}/api/rover/start?farmer_id=${FARMER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ path: drawPath })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to start");
      setCurrentSessionId(data.session_id);
      connectWebSockets(data.session_id); 
    } catch (err) {
      setError(`Mission Error: ${err.message}`);
      setIsScanning(false);
      setConnectionStatus('error');
    }
  };

  const stopScan = async () => {
    const token = localStorage.getItem("token");
    disconnectWebSockets();
    try {
      await fetch(`${VITE_API_URL}/api/rover/stop?farmer_id=${FARMER_ID}`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) { console.error("Stop signal failed"); }
    setIsScanning(false);
    // Note: currentSessionId is kept so results can still be viewed
    setError("Mission complete. Review results below.");
  };

  const handleLocateFarm = async () => {
    if (!searchInput.trim()) return;
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      setCurrentCoords({ lng, lat });
      map.current.flyTo({ center: [lng, lat], zoom: 18 });
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F7F2', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif' }}>
      <header style={{ height: '70px', backgroundColor: theme.darkBrown, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={28} color="#A5D6A7" />
          <span style={{ fontWeight: '900', letterSpacing: '2px' }}>FIELDSIGHT</span>
          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>
            {connectionStatus === 'success' && <><CheckCircle2 size={14} color="#A5D6A7"/> <span style={{color: '#A5D6A7'}}>ROVER ONLINE</span></>}
            {connectionStatus === 'connecting' && <><Loader2 size={14} className="animate-spin"/> <span>SYNCING...</span></>}
            {connectionStatus === 'error' && <><XCircle size={14} color="#FF8A8A"/> <span style={{color: '#FF8A8A'}}>CONNECTION LOST</span></>}
            {connectionStatus === 'offline' && <span style={{opacity: 0.5}}>READY</span>}
          </div>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
      </header>
      
      <main style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#888', letterSpacing: '1px' }}>ROVER ID: {ROVER_ID}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.darkBrown }}>
                      <Battery size={24} color={battery > 20 ? "#2e7d32" : "#d32f2f"} /> 
                      <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{battery}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '12px' }}>
                    <Navigation size={14} /> {liveTelemetry.speed.toFixed(1)} m/s
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                    <span>LATITUDE</span>
                    <span>LONGITUDE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: theme.darkBrown, fontFamily: 'monospace' }}>
                    <span>{liveTelemetry.lat.toFixed(6)}</span>
                    <span>{liveTelemetry.lng.toFixed(6)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '11px' }}>
                    <Clock size={12} /> Sync: {lastUpdate}
                </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: `1px solid ${theme.sageGreen}` }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16}/> MISSION PATH</h4>
            <button 
              onClick={() => {
                setIsDrawing(!isDrawing);
                if (!isDrawing) {
                  setDrawPath([]);
                  map.current.getSource('route')?.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
                }
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isDrawing ? '#FF8C00' : theme.sageGreen, color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}>
              <PenTool size={18} /> {isDrawing ? 'LOCK PATH' : 'DRAW NEW PATH'}
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', padding: '15px', borderRadius: '15px', color: '#991B1B', display: 'flex', gap: '10px', fontSize: '12px', border: '1px solid #EF4444' }}>
              <ShieldAlert size={20} /> <div>{error}</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            {!isScanning && !scanDataBuffer.length > 0 && (
              <button 
                onClick={startFollowPath} 
                disabled={drawPath.length < 2 || connectionStatus === 'error'}
                style={{ width: '100%', padding: '18px', borderRadius: '12px', color: 'white', fontWeight: 'bold', backgroundColor: (drawPath.length < 2) ? '#ccc' : '#2e7d32', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Play size={20} /> DEPLOY ROVER
              </button>
            )}

            {isScanning && (
              <button 
                onClick={stopScan} 
                style={{ width: '100%', padding: '18px', borderRadius: '12px', color: 'white', fontWeight: 'bold', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Square size={20} /> STOP & ANALYZE
              </button>
            )}

            {!isScanning && scanDataBuffer.length > 0 && !showResults && (
              <button 
                onClick={handleRevealResults}
                style={{ width: '100%', padding: '18px', borderRadius: '12px', color: 'white', fontWeight: 'bold', backgroundColor: theme.darkBrown, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Eye size={20} /> VIEW {scanCount} RESULTS
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Target farm address..." 
              style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' }}
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={handleLocateFarm} style={{ padding: '0 25px', backgroundColor: theme.darkBrown, color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>LOCATE</button>
          </div>

          <div ref={mapContainer} style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', backgroundColor: '#eee', position: 'relative', border: '6px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
             <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📍 <span style={{ color: theme.darkBrown }}>{scanCount} ANOMALIES FOUND</span>
                </div>
             </div>

             {isScanning && (
               <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(46, 125, 50, 0.9)', color: 'white', padding: '8px 20px', borderRadius: '30px', fontSize: '13px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(4px)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                 <Loader2 size={16} className="animate-spin" /> LIVE SCANNING ACTIVE
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}