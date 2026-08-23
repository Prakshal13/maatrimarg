import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { api } from '../api/endpoints';
import { 
  MapPin, 
  Navigation, 
  Hospital as HospitalIcon, 
  Layers, 
  LocateFixed, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Flame,
  Clock,
  Phone,
  Battery,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

const LiveNetworkMap = ({ hospitals = [], onSelectHospital, selectedHospitalId }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hospitalsLayerRef = useRef(null);
  const ashaLayerRef = useRef(null);
  const ambulanceLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [mapMode, setMapMode] = useState('topography'); // topography | satellite
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('prompting'); // prompting | granted | denied | unsupported
  const [isLocating, setIsLocating] = useState(false);
  const [nearestHospital, setNearestHospital] = useState(null);

  // Layer Visibility Toggles
  const [showHospitals, setShowHospitals] = useState(true);
  const [showAshaWorkers, setShowAshaWorkers] = useState(true);
  const [showAmbulances, setShowAmbulances] = useState(true);

  // ASHA Workers state
  const [ashaWorkers, setAshaWorkers] = useState([]);

  // Fetch ASHA workers from backend
  const fetchAshaWorkers = async () => {
    try {
      const res = await api.getAshaWorkers();
      if (res.data) {
        setAshaWorkers(res.data);
      }
    } catch (e) {
      console.warn('Could not fetch ASHA workers:', e);
    }
  };

  useEffect(() => {
    fetchAshaWorkers();
  }, []);

  // Distance calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Browser Geolocation Prompt
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }

    setIsLocating(true);
    setGeoStatus('prompting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(coords);
        setGeoStatus('granted');
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.5 });
        }
      },
      (error) => {
        console.warn('Geolocation prompt error or denied:', error.message);
        setGeoStatus('denied');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const defaultCenter = [16.8, 77.5];
    const defaultZoom = 6;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    hospitalsLayerRef.current = L.layerGroup().addTo(map);
    ashaLayerRef.current = L.layerGroup().addTo(map);
    ambulanceLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    requestUserLocation();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Tile Layers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapMode === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '&copy; Esri &mdash; Earthstar Geographics', maxZoom: 19 }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; CARTO', maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);
    }
  }, [mapMode]);

  // 3. User Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></span>
        <span class="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-black">
          ●
        </span>
      </div>
    `;

    const customUserIcon = L.divIcon({
      html: userIconHtml,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], { icon: customUserIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong style="color: #2563eb;">📍 Your Live Location</strong><br/>
          <span style="color: #64748b; font-size: 10px;">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</span>
        </div>`
      );

    userMarkerRef.current = marker;
  }, [userLocation]);

  // 4. Render Hospitals Layer
  useEffect(() => {
    if (!hospitalsLayerRef.current) return;
    const layer = hospitalsLayerRef.current;
    layer.clearLayers();

    if (!showHospitals || !hospitals || hospitals.length === 0) return;

    let closest = null;
    let minDistance = Infinity;

    hospitals.forEach((h) => {
      if (!h.lat || !h.lng) return;

      if (userLocation) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = { ...h, distanceKm: dist };
        }
      }

      const isSurgeonReady = h.surgeon_on_duty;
      const beds = h.beds_available || 0;
      const markerColor = isSurgeonReady && beds > 5 ? '#006b5f' : beds > 0 ? '#0284c7' : '#e11d48';

      const hospitalIconHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <div style="background-color: ${markerColor};" class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-[16px]">local_hospital</span>
          </div>
          <span class="text-[9px] font-bold bg-slate-900/90 text-white px-1.5 py-0.5 rounded shadow-sm mt-0.5 whitespace-nowrap max-w-[100px] truncate">
            ${h.name}
          </span>
        </div>
      `;

      const customHospitalIcon = L.divIcon({
        html: hospitalIconHtml,
        className: 'custom-hospital-marker',
        iconSize: [36, 44],
        iconAnchor: [18, 22],
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; width: 220px; line-height: 1.4; padding: 2px;">
          <div style="font-weight: 800; font-size: 13px; color: #091426; margin-bottom: 2px;">${h.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${h.district || ''}, ${h.state || ''}</div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
            <div>
              <span style="font-size: 10px; color: #64748b; font-weight: 700;">AVAIL BEDS</span><br/>
              <strong style="color: #006b5f; font-size: 13px;">${h.beds_available}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748b; font-weight: 700;">NICU BEDS</span><br/>
              <strong style="color: #0284c7; font-size: 13px;">${h.nicu_beds_available}</strong>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 8px;">
            <span>Surgeon on Duty:</span>
            <span style="color: ${h.surgeon_on_duty ? '#16a34a' : '#e11d48'};">${h.surgeon_on_duty ? 'YES' : 'NO'}</span>
          </div>

          <button 
            id="dispatch-btn-${h.id}" 
            style="width: 100%; background: #091426; color: white; border: none; border-radius: 6px; padding: 6px; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
          >
            ⚡ Route 108 Dispatch Here
          </button>
        </div>
      `;

      const marker = L.marker([h.lat, h.lng], { icon: customHospitalIcon })
        .addTo(layer)
        .bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`dispatch-btn-${h.id}`);
        if (btn && onSelectHospital) {
          btn.onclick = () => onSelectHospital(h);
        }
      });
    });

    setNearestHospital(closest);

    // Draw route if closest hospital exists
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
      if (userLocation && closest) {
        L.polyline([[userLocation.lat, userLocation.lng], [closest.lat, closest.lng]], {
          color: '#006b5f',
          weight: 3.5,
          dashArray: '8, 8',
          opacity: 0.85,
        }).addTo(routeLayerRef.current);
      }
    }
  }, [hospitals, userLocation, showHospitals]);

  // 5. Render ASHA Workers Layer (👩‍⚕️)
  useEffect(() => {
    if (!ashaLayerRef.current) return;
    const layer = ashaLayerRef.current;
    layer.clearLayers();

    if (!showAshaWorkers || !ashaWorkers || ashaWorkers.length === 0) return;

    ashaWorkers.forEach((worker) => {
      if (!worker.lat || !worker.lng) return;

      const isSos = worker.status === 'emergency_sos';
      const isInVisit = worker.status === 'in_anc_visit';
      const bgColor = isSos ? '#e11d48' : isInVisit ? '#f59e0b' : '#7c3aed';

      const ashaIconHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          ${isSos ? '<span class="absolute w-10 h-10 rounded-full bg-rose-500/50 animate-ping"></span>' : ''}
          <div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white hover:scale-110 transition-transform">
            <span class="text-sm font-bold">👩‍⚕️</span>
          </div>
          <span class="text-[9px] font-extrabold bg-purple-950/90 text-purple-200 border border-purple-400/40 px-1.5 py-0.5 rounded shadow-sm mt-0.5 whitespace-nowrap">
            ASHA: ${worker.name.split(' ')[0]}
          </span>
        </div>
      `;

      const customAshaIcon = L.divIcon({
        html: ashaIconHtml,
        className: 'custom-asha-marker',
        iconSize: [36, 44],
        iconAnchor: [18, 22],
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; width: 230px; line-height: 1.4; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #6b21a8; font-size: 13px;">${worker.name}</strong>
            <span style="background: ${isSos ? '#ffe4e6' : '#f3e8ff'}; color: ${isSos ? '#be123c' : '#7e22ce'}; padding: 2px 6px; border-radius: 999px; font-size: 9px; font-weight: 800; text-transform: uppercase;">
              ${worker.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            <strong>ID:</strong> ${worker.asha_id} • ${worker.village_area} (${worker.district})
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #faf5ff; padding: 6px; border-radius: 8px; border: 1px solid #e9d5ff; margin-bottom: 8px; font-size: 11px;">
            <div>
              <span style="font-size: 10px; color: #6b21a8; font-weight: 700;">ACTIVE MOTHERS</span><br/>
              <strong style="color: #1e1b4b; font-size: 12px;">${worker.active_mothers_count} Assigned</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #6b21a8; font-weight: 700;">DEVICE BATTERY</span><br/>
              <strong style="color: #16a34a; font-size: 12px;">🔋 ${worker.battery_level}%</strong>
            </div>
          </div>

          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            <strong>Phone:</strong> ${worker.phone}
          </div>

          <a 
            href="tel:${worker.phone}" 
            style="width: 100%; box-sizing: border-box; background: #6b21a8; color: white; text-decoration: none; border-radius: 6px; padding: 6px; font-weight: 700; font-size: 11px; text-align: center; display: block;"
          >
            📞 Contact ASHA Worker
          </a>
        </div>
      `;

      L.marker([worker.lat, worker.lng], { icon: customAshaIcon })
        .addTo(layer)
        .bindPopup(popupContent);
    });
  }, [ashaWorkers, showAshaWorkers]);

  // 6. Render 108 Ambulances Layer (🚑)
  useEffect(() => {
    if (!ambulanceLayerRef.current) return;
    const layer = ambulanceLayerRef.current;
    layer.clearLayers();

    if (!showAmbulances) return;

    const sampleAmbulances = [
      { id: '108-MH-34', lat: 19.395, lng: 80.221, name: '108 Unit MH-34', eta: '4 min', status: 'En Route', patient: 'Severe Pre-Eclampsia' },
      { id: '108-MH-27', lat: 21.398, lng: 77.291, name: '108 Unit MH-27', eta: '14 min', status: 'Dispatched', patient: 'ANC Complication' },
      { id: '108-TN-01', lat: 13.045, lng: 80.245, name: '108 Unit TN-01', eta: '8 min', status: 'En Route', patient: 'Fetal Distress' }
    ];

    sampleAmbulances.forEach((amb) => {
      const ambIconHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <span class="absolute w-8 h-8 rounded-full bg-rose-500/40 animate-ping"></span>
          <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs hover:scale-110 transition-transform">
            🚑
          </div>
          <span class="text-[9px] font-extrabold bg-rose-950 text-rose-200 border border-rose-500/40 px-1.5 py-0.5 rounded shadow-sm mt-0.5 whitespace-nowrap">
            ${amb.name} (ETA ${amb.eta})
          </span>
        </div>
      `;

      const customAmbIcon = L.divIcon({
        html: ambIconHtml,
        className: 'custom-amb-marker',
        iconSize: [36, 44],
        iconAnchor: [18, 22],
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; width: 200px; line-height: 1.4;">
          <strong style="color: #e11d48; font-size: 13px;">🚨 ${amb.name}</strong><br/>
          <span style="color: #475569; font-size: 11px;">Status: <strong>${amb.status}</strong> • ETA: <strong>${amb.eta}</strong></span><br/>
          <div style="margin-top: 6px; padding: 4px 6px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; font-size: 10px; color: #9f1239;">
            Case: <strong>${amb.patient}</strong>
          </div>
        </div>
      `;

      L.marker([amb.lat, amb.lng], { icon: customAmbIcon })
        .addTo(layer)
        .bindPopup(popupContent);
    });
  }, [showAmbulances]);

  return (
    <div className="relative w-full h-full flex flex-col min-h-[420px] bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      
      {/* Top Map Toolbar with Layer Controls */}
      <div className="p-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md z-[400] flex flex-wrap justify-between items-center gap-2.5">
        
        {/* Left Title & Facilities Badge */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#006b5f]" />
            <span>Live Regional Medical GIS Matrix</span>
          </h3>
        </div>

        {/* Middle: Interactive Filter Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              showHospitals ? 'bg-white text-teal-800 shadow-2xs font-black' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>🏥</span>
            <span className="hidden sm:inline">Hospitals ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setShowAshaWorkers(!showAshaWorkers)}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              showAshaWorkers ? 'bg-white text-purple-800 shadow-2xs font-black' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>👩‍⚕️</span>
            <span className="hidden sm:inline">ASHA Agents ({ashaWorkers.length})</span>
          </button>

          <button
            onClick={() => setShowAmbulances(!showAmbulances)}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              showAmbulances ? 'bg-white text-rose-800 shadow-2xs font-black' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>🚑</span>
            <span className="hidden sm:inline">108 Fleet (3)</span>
          </button>

        </div>

        {/* Right Actions: Locate Me & Map Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={requestUserLocation}
            disabled={isLocating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            title="Locate My Live Position"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMapMode('topography')}
              className={`px-2 py-1 rounded-md transition-colors ${
                mapMode === 'topography'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Topography
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2 py-1 rounded-md transition-colors ${
                mapMode === 'satellite'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

      </div>

      {/* Geolocation Status Alert Bar */}
      {geoStatus === 'denied' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] font-bold text-amber-900 flex items-center justify-between z-[400]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Location permission was blocked. Viewing regional Maharashtra & Tamil Nadu grid.</span>
          </div>
          <button
            onClick={requestUserLocation}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition-colors"
          >
            Enable Location
          </button>
        </div>
      )}

      {geoStatus === 'granted' && userLocation && nearestHospital && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 text-[11px] font-bold text-emerald-900 flex items-center justify-between z-[400]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Live GPS Locked. Nearest tertiary center: <strong>{nearestHospital.name}</strong> (~{nearestHospital.distanceKm.toFixed(1)} km, est. {Math.round(nearestHospital.distanceKm * 1.6)}m transit).
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-extrabold">LIVE 108 READY</span>
        </div>
      )}

      {/* Actual Interactive Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full flex-1 z-0 relative min-h-[350px]" 
        style={{ minHeight: '360px' }}
      />

    </div>
  );
};

export default LiveNetworkMap;
