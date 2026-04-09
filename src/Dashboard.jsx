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

  // 1. INITIALIZE MAP
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
      });
    } catch (e) {
      setError(`Startup Error: ${e.message}`);
    }
    return () => map.current?.remove();
  }, []);

  // 2. DRAWING HANDLER
  useEffect(() => {
    if (!map.current) return;
    const handleMapClick = (e) => {
      if (!isDrawing) return;
      const newPoint = [e.lngLat.lng, e.lngLat.lat];
      setDrawPath((prev) => {
        const updated = [...prev, newPoint];
        const source = map.current.getSource('route');
        if (source) source.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: updated } });
        return updated;
      });
    };
    map.current.on('click', handleMapClick);
    return () => map.current?.off('click', handleMapClick);
  }, [isDrawing]);

  // 3. NAVIGATION & PIN GENERATION
  const startFollowPath = () => {
    if (drawPath.length < 2) {
      setError("Please draw a path first.");
      return;
    }

    setIsScanning(true);
    setIsDrawing(false);
    setScanComplete(false);
    setError(null);
    resultMarkers.current.forEach(m => m.remove());
    resultMarkers.current = [];

    const el = document.createElement('div');
    el.innerHTML = `<span style="font-size: 30px;">🚜</span>`; 
    roverMarker.current = new mapboxgl.Marker(el).setLngLat(drawPath[0]).addTo(map.current);

    let step = 0;
    const moveInterval = setInterval(() => {
      try {
        if (step >= drawPath.length) {
          clearInterval(moveInterval);
          setIsScanning(false);
          setScanComplete(true);
          roverMarker.current?.remove();
          return;
        }

        const target = drawPath[step];
        roverMarker.current.setLngLat(target);
        map.current.easeTo({ center: target, duration: 800 });

        // Logic to "find" an issue every few steps for demo purposes
        if (step > 0 && step % 3 === 0) {
          let type, color;
          // IF-ELSE logic to determine issue category
          if (step === 3) {
            type = "Early Signs Detected";
            color = theme.severity.early;
          } else if (step === 6) {
            type = "Moderate Infection";
            color = theme.severity.moderate;
          } else {
            type = "Critical Action Required";
            color = theme.severity.critical;
          }

          const popupMarkup = `
            <div style="padding: 10px; min-width: 150px;">
              <div style="width: 100%; height: 80px; background: #eee; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px; border: 1px dashed #ccc;">
                [No Image Available]
              </div>
              <strong style="color: ${color}; display: block; margin-bottom: 4px;">${type}</strong>
              <div style="font-size: 11px; color: #666;">
                Loc: ${target[0].toFixed(4)}, ${target[1].toFixed(4)}<br/>
                Status: Pending Review
              </div>
            </div>
          `;

          const m = new mapboxgl.Marker({ color })
            .setLngLat(target)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupMarkup))
            .addTo(map.current);
          
          resultMarkers.current.push(m);
        }

        step++;
      } catch (err) {
        setError(`Animation Error: ${err.message}`);
        clearInterval(moveInterval);
      }
    }, 1200);
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
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: theme.textGrey }}>SYSTEM STATUS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.darkBrown }}>
              <Battery size={24} color="#2e7d32" /> <span style={{ fontSize: '24px', fontWeight: 'bold' }}>88%</span>
            </div>
          </div>

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
            <div style={{ marginTop: '15px', fontSize: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                 <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.severity.early }} /> Early Signs
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                 <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.severity.moderate }} /> Moderate
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.severity.critical }} /> Critical
               </div>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', padding: '15px', borderRadius: '15px', color: '#991B1B', display: 'flex', gap: '10px', fontSize: '12px', border: '1px solid #EF4444' }}>
              <ShieldAlert size={20} /> <div><b>Error:</b> {error}</div>
            </div>
          )}

          <button 
            onClick={startFollowPath} 
            disabled={isScanning || drawPath.length < 2}
            style={{ marginTop: 'auto', padding: '18px', borderRadius: '12px', color: 'white', fontWeight: 'bold', backgroundColor: (isScanning || drawPath.length < 2) ? '#ccc' : '#2e7d32', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {isScanning ? <Loader2 className="animate-spin" /> : <Play />} 
            {isScanning ? 'SCANNING...' : 'RUN PLANNED PATH'}
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
                 Click map to set Waypoints
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}