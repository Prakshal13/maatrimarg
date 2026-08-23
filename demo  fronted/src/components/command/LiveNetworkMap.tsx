import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hospital } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface LiveNetworkMapProps {
  hospitals: Hospital[];
  selectedOriginId: string | null;
  recommendedHospitalId: string | null;
  userLocation?: { lat: number; lng: number } | null;
  onSelectOrigin: (hospitalId: string) => void;
  isLoading?: boolean;
}

interface RealHeatZone {
  id: string;
  name: string;
  nameMr: string;
  nameHi: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  intensity: 'HIGH' | 'MODERATE' | 'LOW';
  score: number;
  color: string;
  fillColor: string;
}

const MAHARASHTRA_HEAT_ZONES: RealHeatZone[] = [
  { id: 'hz-mumbai', name: 'Mumbai Coastal Apex & Dharavi', nameMr: 'मुंबई कोस्टल केंद्र व धारावी', nameHi: 'मुंबई तटीय केंद्र एवं धारावी', lat: 19.015, lng: 72.848, radiusMeters: 35000, intensity: 'HIGH', score: 88, color: '#ef4444', fillColor: '#ef4444' },
  { id: 'hz-nagpur', name: 'Nagpur Critical Cluster', nameMr: 'नागपूर जोखीम विभाग', nameHi: 'नागपुर क्रिटिकल क्लस्टर', lat: 21.145, lng: 79.088, radiusMeters: 55000, intensity: 'HIGH', score: 82, color: '#ef4444', fillColor: '#ef4444' },
  { id: 'hz-csn', name: 'Sambhajinagar Divert Zone', nameMr: 'संभाजीनगर डायव्हर्ट झोन', nameHi: 'संभाजीनगर डायवर्ट ज़ोन', lat: 19.876, lng: 75.343, radiusMeters: 45000, intensity: 'HIGH', score: 94, color: '#ef4444', fillColor: '#f97316' },
  { id: 'hz-pune', name: 'Pune High Transit Corridor', nameMr: 'पुणे ट्रान्सिट कॉरिडोअर', nameHi: 'पुणे ट्रांजिट कॉरिडोर', lat: 18.520, lng: 73.856, radiusMeters: 42000, intensity: 'MODERATE', score: 62, color: '#f59e0b', fillColor: '#f59e0b' },
  { id: 'hz-nsk', name: 'Nashik Stabilized Sector', nameMr: 'नाशिक स्थिर क्षेत्र', nameHi: 'नासिक स्थिर सेक्टर', lat: 19.997, lng: 73.789, radiusMeters: 38000, intensity: 'LOW', score: 38, color: '#14b8a6', fillColor: '#14b8a6' },
  { id: 'hz-kol', name: 'Kolhapur South Hub', nameMr: 'कोल्हापूर दक्षिण विभाग', nameHi: 'कोल्हापुर दक्षिण हब', lat: 16.705, lng: 74.243, radiusMeters: 40000, intensity: 'MODERATE', score: 55, color: '#f59e0b', fillColor: '#f59e0b' },
  { id: 'hz-sol', name: 'Solapur Maternal Care Node', nameMr: 'सोलापूर नोड', nameHi: 'सोलापूर नोड', lat: 17.659, lng: 75.906, radiusMeters: 36000, intensity: 'MODERATE', score: 52, color: '#f59e0b', fillColor: '#eab308' },
  { id: 'hz-amr', name: 'Amravati Vidarbha Node', nameMr: 'अमरावती विदर्भ नोड', nameHi: 'अमरावती विदर्भ नोड', lat: 20.937, lng: 77.779, radiusMeters: 40000, intensity: 'MODERATE', score: 58, color: '#f59e0b', fillColor: '#f59e0b' }
];

export const LiveNetworkMap: React.FC<LiveNetworkMapProps> = ({
  hospitals,
  selectedOriginId,
  recommendedHospitalId,
  userLocation,
  onSelectOrigin,
  isLoading = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapMode, setMapMode] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [isHeatmapOverlayActive, setIsHeatmapOverlayActive] = useState<boolean>(true);
  const { t, language } = useThemeLanguage();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.25, 75.80],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      // Default to Carto Voyager (Google Maps / Clean Street style)
      const tile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);

      tileLayerRef.current = tile;
      markersLayerRef.current = L.layerGroup().addTo(map);
      heatLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Mode Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapMode === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapMode === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    const newTile = L.tileLayer(url, { maxZoom: 19, subdomains: 'abcd' }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapMode]);

  // Render Heatmap Overlay on Real Geography
  useEffect(() => {
    if (!heatLayerRef.current) return;
    heatLayerRef.current.clearLayers();

    if (!isHeatmapOverlayActive) return;

    MAHARASHTRA_HEAT_ZONES.forEach((zone) => {
      // Outer glow circle
      const outerCircle = L.circle([zone.lat, zone.lng], {
        radius: zone.radiusMeters,
        color: zone.color,
        weight: 1.5,
        opacity: 0.7,
        fillColor: zone.fillColor,
        fillOpacity: zone.intensity === 'HIGH' ? 0.35 : zone.intensity === 'MODERATE' ? 0.25 : 0.18,
        className: 'animate-pulse'
      });

      // Inner dense core circle
      const innerCircle = L.circle([zone.lat, zone.lng], {
        radius: zone.radiusMeters * 0.45,
        color: zone.color,
        weight: 2,
        opacity: 0.85,
        fillColor: zone.color,
        fillOpacity: zone.intensity === 'HIGH' ? 0.55 : 0.4
      });

      outerCircle.bindTooltip(
        `<div class="text-xs font-bold font-sans">${language === 'mr' ? zone.nameMr : language === 'hi' ? zone.nameHi : zone.name}</div><div class="text-[10px] text-slate-300">${t('riskDensity')}: ${zone.score}%</div>`,
        { direction: 'top', className: 'bg-slate-900 text-white p-1 rounded border border-slate-700' }
      );

      heatLayerRef.current?.addLayer(outerCircle);
      heatLayerRef.current?.addLayer(innerCircle);
    });
  }, [isHeatmapOverlayActive, language]);

  // Render Hospital Markers & Active Route & User Location
  useEffect(() => {
    if (!markersLayerRef.current || !routeLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();
    routeLayerRef.current.clearLayers();

    const originHosp = hospitals.find(h => h.id === selectedOriginId);
    const destHosp = hospitals.find(h => h.id === recommendedHospitalId);

    // User Home/GPS Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%);">
            <div style="
              width: 22px; 
              height: 22px; 
              border-radius: 50%; 
              background-color: #3b82f6; 
              border: 3px solid white; 
              box-shadow: 0 0 20px #3b82f6;
              animation: pulse 1.2s infinite;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
            ">🏠</div>
            <div style="
              margin-top: 3px; 
              font-family: system-ui, sans-serif; 
              font-size: 10px; 
              font-weight: bold; 
              padding: 2px 6px; 
              border-radius: 4px; 
              background: #1e3a8a; 
              color: white; 
              border: 1px solid #60a5fa; 
              white-space: nowrap; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            ">
              ${language === 'mr' ? '📍 माझे घर / थेट स्थान' : language === 'hi' ? '📍 मेरा घर / लाइव स्थान' : '📍 My Location / Home'}
            </div>
          </div>
        `,
        iconSize: [32, 44],
        iconAnchor: [16, 22]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      markersLayerRef.current.addLayer(userMarker);
    }

    // Determine Route Start Coordinates (User GPS or Selected Origin Hospital)
    const startCoords = userLocation || (originHosp && originHosp.lat && originHosp.lng ? { lat: originHosp.lat, lng: originHosp.lng } : null);

    // Draw Animated Route Polyline
    if (startCoords && destHosp && destHosp.lat && destHosp.lng) {
      const latlngs: [number, number][] = [
        [startCoords.lat, startCoords.lng],
        // Midpoint curved control
        [(startCoords.lat + destHosp.lat) / 2 + (startCoords.lat > destHosp.lat ? 0.12 : -0.12), (startCoords.lng + destHosp.lng) / 2 + 0.12],
        [destHosp.lat, destHosp.lng]
      ];

      const routeLine = L.polyline(latlngs, {
        color: '#0d9488',
        weight: 4.5,
        opacity: 0.95,
        dashArray: '8, 6',
        lineCap: 'round'
      });

      routeLayerRef.current.addLayer(routeLine);
    }

    // Add Hospital Markers
    hospitals.forEach((hosp) => {
      if (!hosp.lat || !hosp.lng) return;

      const isOrigin = hosp.id === selectedOriginId && !userLocation;
      const isRecommended = hosp.id === recommendedHospitalId;
      const isDivert = hosp.status === 'DIVERT' || hosp.available_beds === 0;
      const isCritical = hosp.available_beds > 0 && hosp.available_beds < 5;

      let markerBg = '#14b8a6';
      let borderGlow = 'rgba(20, 184, 166, 0.6)';
      let badgeText = `${hosp.availableIcuBeds} ICU`;

      if (isDivert) {
        markerBg = '#ef4444';
        borderGlow = 'rgba(239, 68, 68, 0.8)';
        badgeText = 'DIVERT';
      } else if (isCritical) {
        markerBg = '#f59e0b';
        borderGlow = 'rgba(245, 158, 11, 0.7)';
      }

      if (isOrigin) {
        markerBg = '#0284c7';
        borderGlow = 'rgba(2, 132, 199, 0.9)';
      } else if (isRecommended) {
        markerBg = '#0d9488';
        borderGlow = 'rgba(13, 148, 136, 0.9)';
      }

      const customIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%);">
            <div style="
              width: 18px; 
              height: 18px; 
              border-radius: 50%; 
              background-color: ${markerBg}; 
              border: 2.5px solid white; 
              box-shadow: 0 0 14px ${borderGlow};
              ${isOrigin || isRecommended ? 'animation: pulse 1.5s infinite;' : ''}
            "></div>
            <div style="
              margin-top: 3px; 
              font-family: monospace; 
              font-size: 9px; 
              font-weight: bold; 
              padding: 1px 5px; 
              border-radius: 4px; 
              background: rgba(15, 23, 42, 0.9); 
              color: white; 
              border: 1px solid rgba(255,255,255,0.2); 
              white-space: nowrap; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${isOrigin ? '🚩 ORIGIN' : isRecommended ? '⭐ DESTINATION' : badgeText}
            </div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 21]
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: customIcon });

      // Popup Content with Direct Google Maps Link
      const gMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}&travelmode=driving`;

      const popupHtml = `
        <div style="padding: 14px; min-width: 230px; font-family: system-ui, sans-serif;">
          <div style="font-size: 13px; font-weight: bold; color: #f8fafc; margin-bottom: 2px;">${hosp.name}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">${hosp.district}, Maharashtra</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px 0; border-top: 1px solid #334155; border-bottom: 1px solid #334155; font-size: 11px; margin-bottom: 10px;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">ICU Beds</span>
              <strong style="color: #2dd4bf; font-family: monospace; font-size: 12px;">${hosp.availableIcuBeds} / ${hosp.totalIcuBeds}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 10px;">Total Beds</span>
              <strong style="color: #2dd4bf; font-family: monospace; font-size: 12px;">${hosp.available_beds} / ${hosp.total_beds}</strong>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button 
              id="btn-set-origin-${hosp.id}" 
              style="flex: 1; background: #0d9488; color: white; border: none; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;"
            >
              ${t('setAsOrigin')}
            </button>
            <a 
              href="${gMapsUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none; display: flex; align-items: center; justify-content: center;"
            >
              Google Maps ➔
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-set-origin-${hosp.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectOrigin(hosp.id);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectOrigin(hosp.id);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [hospitals, selectedOriginId, recommendedHospitalId, userLocation, language]);

  const handleCenterMaharashtra = () => {
    if (mapInstanceRef.current) {
      if (userLocation) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 12);
      } else {
        mapInstanceRef.current.setView([19.25, 75.80], 7);
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[490px] bg-slate-950 rounded-xl overflow-hidden shadow-sm border border-surface-border dark:border-slate-800 select-none flex flex-col justify-between">
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-10" />

      {/* Top Floating Control Bar */}
      <div className="relative z-20 flex flex-wrap justify-between items-center bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 m-3 rounded-xl border border-surface-border dark:border-slate-800 shadow-md gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-accent text-[18px]">
            map
          </span>
          <span className="text-label-caps font-bold text-primary dark:text-slate-100 uppercase tracking-wider text-xs">
            {t('liveNetworkMatrix')}
          </span>
          {isHeatmapOverlayActive && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40">
              HEATMAP ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Heatmap Overlay Toggle Button */}
          <button
            onClick={() => setIsHeatmapOverlayActive(!isHeatmapOverlayActive)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              isHeatmapOverlayActive
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'bg-surface-container-low dark:bg-slate-800 border-surface-border dark:border-slate-700 text-on-surface-variant dark:text-slate-400 hover:text-primary'
            }`}
            title="Toggle Maternal Risk Density Heatmap on Real Map"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-500">
              {isHeatmapOverlayActive ? 'local_fire_department' : 'layers_clear'}
            </span>
            <span>{t('heatmapOverlay')}</span>
          </button>

          {/* Map Layer Mode */}
          <div className="flex items-center bg-surface-container-low dark:bg-slate-800 p-0.5 rounded-lg border border-surface-border dark:border-slate-700">
            <button
              onClick={() => setMapMode('streets')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                mapMode === 'streets'
                  ? 'bg-surface-container-lowest dark:bg-slate-700 text-primary dark:text-white shadow-xs'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-primary'
              }`}
            >
              {language === 'mr' ? 'गुगल / रस्ते दृश्य' : language === 'hi' ? 'सड़क दृश्य (Google)' : 'Streets'}
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                mapMode === 'satellite'
                  ? 'bg-surface-container-lowest dark:bg-slate-700 text-primary dark:text-white shadow-xs'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-primary'
              }`}
            >
              {t('satellite')}
            </button>
            <button
              onClick={() => setMapMode('dark')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                mapMode === 'dark'
                  ? 'bg-surface-container-lowest dark:bg-slate-700 text-primary dark:text-white shadow-xs'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-primary'
              }`}
            >
              {language === 'mr' ? 'डार्क मोड' : language === 'hi' ? 'डार्क मोड' : 'Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Floating Bar: Heatmap Legend & Map Reset */}
      <div className="relative z-20 flex justify-between items-end p-3 pointer-events-none">
        {/* Heatmap Legend */}
        {isHeatmapOverlayActive && (
          <div className="pointer-events-auto bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-surface-border dark:border-slate-800 shadow-md text-[10px] space-y-1.5 animate-reveal">
            <span className="font-bold text-primary dark:text-slate-200 block uppercase tracking-wider text-[9px]">
              {t('riskDensity')} (Maharashtra)
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <span className="text-on-surface-variant dark:text-slate-300 font-medium">{t('highRisk')}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-on-surface-variant dark:text-slate-300 font-medium">{t('moderateRisk')}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span className="text-on-surface-variant dark:text-slate-300 font-medium">{t('lowRisk')}</span>
              </span>
            </div>
          </div>
        )}

        {/* Center Maharashtra / Zoom Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-surface-border dark:border-slate-800 shadow-md ml-auto">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300 hover:text-primary transition-colors text-sm font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300 hover:text-primary transition-colors text-sm font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleCenterMaharashtra}
            className="px-2 h-7 flex items-center justify-center rounded-lg bg-surface-container-low dark:bg-slate-800 text-[10px] font-semibold text-secondary dark:text-teal-400 transition-colors"
            title="Reset to Maharashtra Center"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="font-semibold text-sm">
            {language === 'mr'
              ? 'रुग्णवाहिका संदर्भ मार्ग शोधत आहे...'
              : language === 'hi'
              ? 'इष्टतम मातृ स्थानांतरण मार्ग खोजा जा रहा है...'
              : 'Calculating optimal maternal transit route...'}
          </p>
        </div>
      )}
    </div>
  );
};
