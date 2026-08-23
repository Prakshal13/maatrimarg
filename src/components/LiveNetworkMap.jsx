import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
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
  Clock
} from 'lucide-react';

const LiveNetworkMap = ({ hospitals = [], onSelectHospital, selectedHospitalId }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [mapMode, setMapMode] = useState('topography'); // topography | satellite
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('prompting'); // prompting | granted | denied | unsupported
  const [nearestHospital, setNearestHospital] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Haversine distance calculator in KM
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Request user's live browser location
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

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on Central India / Maharashtra & Tamil Nadu
    const defaultCenter = [16.8, 77.5];
    const defaultZoom = 6;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: false,
    });

    // Custom Zoom controls at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Auto-prompt location on initial load
    requestUserLocation();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Tile Layer Switcher (Topography vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapMode === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Earthstar Geographics',
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);
    }
  }, [mapMode]);

  // 3. Render User Location Pulsing Marker
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

  // 4. Render Hospital Markers & Live Polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    markersLayer.clearLayers();
    routeLayer.clearLayers();

    if (!hospitals || hospitals.length === 0) return;

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
        .addTo(markersLayer)
        .bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`dispatch-btn-${h.id}`);
        if (btn && onSelectHospital) {
          btn.onclick = () => onSelectHospital(h);
        }
      });
    });

    setNearestHospital(closest);

    // If user location exists and we found a nearest hospital, draw glowing polyline
    if (userLocation && closest) {
      const latlngs = [
        [userLocation.lat, userLocation.lng],
        [closest.lat, closest.lng],
      ];
      L.polyline(latlngs, {
        color: '#006b5f',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(routeLayer);
    }
  }, [hospitals, userLocation]);

  return (
    <div className="relative w-full h-full flex flex-col min-h-[380px] bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      
      {/* Top Map Toolbar */}
      <div className="p-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md z-[400] flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#006b5f]" />
            <span>Live Regional Hospital GPS Grid</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#006b5f]">
            {hospitals.length} Facilities Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Locate Me GPS Button */}
          <button
            onClick={requestUserLocation}
            disabled={isLocating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            title="Locate My Live Position"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {/* Topography vs Satellite Switcher */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMapMode('topography')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mapMode === 'topography'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Topography
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
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
            <span>Location permission was blocked or unavailable. Viewing regional Maharashtra & Tamil Nadu grid.</span>
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
        className="w-full flex-1 z-0 relative min-h-[320px]" 
        style={{ minHeight: '340px' }}
      />

    </div>
  );
};

export default LiveNetworkMap;
