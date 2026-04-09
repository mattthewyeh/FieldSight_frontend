import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Battery, Power, Radio, Loader2, CheckCircle, ShieldAlert, PenTool, Play } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Dashboard({ onLogout, farmCoords }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const roverMarker = useRef(null);
  const resultMarkers = useRef([]); 
  
  // States
  const [searchInput, setSearchInput] = useState('');
  const [currentCoords, setCurrentCoords] = useState(farmCoords || { lng: -121.88107, lat: 37.33332 });
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState(null);

  const theme = {
    sageGreen: '#A3B18A',
    darkBrown: '#3E2723',
    cardWhite: '#FFFFFF',
    textGrey: '#4A4A4A',
    severity: { early: '#FFD700', moderate: '#FF8C00', critical: '#FF0000' }
  };

  // 1. INITIALIZE MAP (Once Only)
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError("Config Error: Mapbox Token missing.");
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [currentCoords.lng, currentCoords.lat],
        zoom: 18
      });

      map.current.on('load', () => {
        map.current.resize();
        
        // Add Path Data Source
        map.current.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
        });

        // Add Path Visual Layer
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#A5D6A7', 'line-width': 4, 'line-dasharray': [2, 1] }
        });
      });

      map.current.on('error', (e) => setError(`Mapbox Error: ${e.error?.message}`));

    } catch (e) {
      setError(`Startup Error: ${e.message}`);
    }

    return () => map.current?.remove();
  }, []);

  // 2. DRAWING CLICK HANDLER
  // We use a separate effect for the click event so we don't rebuild the map
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e) => {
      if (!isDrawing) return;

      try {
        const newPoint = [e.lngLat.lng, e.lngLat.lat];
        setDrawPath((prev) => {
          const updated = [...prev, newPoint];
          // Update the line on the map immediately
          const source = map.current.getSource('route');
          if (source) {
            source.setData({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: updated }
            });
          }
          return updated;
        });
      } catch (err) {
        setError(`Drawing Error: ${err.message}`);
        setIsDrawing(false);
      }
    };

    map.current.on('click', handleMapClick);
    return () => map.current?.off('click', handleMapClick);
  }, [isDrawing]);

  // 3. NAVIGATION LOGIC
  const startFollowPath = () => {
    if (drawPath.length < 2) {
      setError("Please click on the map to draw a path first.");
      return;
    }

    setIsScanning(true);
    setIsDrawing(false);
    setScanComplete(false);
    setError(null);

    // Clear old markers
    resultMarkers.current.forEach(m => m.remove());
    resultMarkers.current = [];

    const el = document.createElement('div');
    el.innerHTML = `<span style="font-size: 30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🚜</span>`; 
    
    roverMarker.current = new mapboxgl.Marker(el)
      .setLngLat(drawPath[0])
      .addTo(map.current);

    let step = 0;
    const moveInterval = setInterval(() => {
      try {
        if (step >= drawPath.length) {
          clearInterval(moveInterval);
          setIsScanning(false);
          setScanComplete(true);
          if (roverMarker.current) roverMarker.current.remove();
          return;
        }

        const target = drawPath[step];
        roverMarker.current.setLngLat(target);
        map.current.easeTo({ center: target, duration: 800 });
        step++;
      } catch (err) {
        setError(`Rover Crash: ${err.message}`);
        clearInterval(moveInterval);
        setIsScanning(false);
      }
    }, 1000);
  };

  const handleLocateFarm = async () => {
    if (!searchInput.trim()) return;
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${MAPBOX_TOKEN}`);
      const data = await response.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCurrentCoords({ lng, lat });
        map.current.flyTo({ center: [lng, lat], zoom: 18 });
      }
    } catch (e) { setError("Location search failed."); }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F7F2', position: 'fixed', top: 0, left: 0, fontFamily: "'Inter', sans-serif" }}>
      <header style={{ height: '70px', backgroundColor: theme.darkBrown, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={28} color="#A5D6A7" />
          <span style={{ fontWeight: '900', letterSpacing: '2px' }}>FIELDSIGHT</span>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </header>
      
      <main style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Status Section */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: theme.textGrey }}>SYSTEM STATUS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.darkBrown }}>
              <Battery size={24} color="#2e7d32" /> <span style={{ fontSize: '24px', fontWeight: 'bold' }}>88%</span>
            </div>
          </div>

          {/* Path Planner Section */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: `1px solid ${theme.sageGreen}` }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: 'bold' }}>PATH PLANNER</h4>
            <button 
              onClick={() => {
                setIsDrawing(!isDrawing);
                if (!isDrawing) {
                  setDrawPath([]);
                  if (map.current.getSource('route')) {
                    map.current.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
                  }
                }
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isDrawing ? '#FF8C00' : theme.sageGreen, color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <PenTool size={18} /> {isDrawing ? 'LOCK PATH' : 'DRAW PATH'}
            </button>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '10px' }}>
              {isDrawing ? "Click on the map to add waypoints." : "Plan a custom route for the rover."}
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', padding: '15px', borderRadius: '15px', color: '#991B1B', display: 'flex', gap: '10px', fontSize: '12px', border: '1px solid #EF4444' }}>
              <ShieldAlert size={20} /> <div><b>Error:</b> {error}</div>
            </div>
          )}

          {scanComplete && (
            <div style={{ backgroundColor: '#E8F5E9', padding: '15px', borderRadius: '15px', border: '1px solid #2e7d32', color: '#2e7d32', fontSize: '12px' }}>
              <CheckCircle size={18} /> Path completed successfully.
            </div>
          )}

          <button 
            onClick={startFollowPath} 
            disabled={isScanning || drawPath.length < 2}
            style={{ marginTop: 'auto', padding: '18px', borderRadius: '12px', color: 'white', fontWeight: 'bold', backgroundColor: (isScanning || drawPath.length < 2) ? '#ccc' : '#2e7d32', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {isScanning ? <Loader2 className="animate-spin" /> : <Play />} 
            {isScanning ? 'MOVING...' : 'RUN PLANNED PATH'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Enter farm address..." 
              style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd' }}
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocateFarm()}
            />
            <button onClick={handleLocateFarm} style={{ padding: '0 25px', backgroundColor: theme.darkBrown, color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>LOCATE</button>
          </div>

          <div ref={mapContainer} style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', backgroundColor: '#eee', position: 'relative', border: '6px solid white', cursor: isDrawing ? 'crosshair' : 'grab' }}>
             {isDrawing && (
               <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 20px', borderRadius: '30px', fontSize: '13px', zIndex: 10, border: '1px solid white' }}>
                 Drawing Mode: Click map to set points
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}