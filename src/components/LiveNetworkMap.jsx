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
  UserCheck,
  Play,
  Pause,
  Zap,
  Gauge,
  Crosshair
} from 'lucide-react';

// Pre-configured realistic 108 emergency corridor routes across MH and TN
const INITIAL_FLEET_MISSIONS = [
  {
    id: '108-MH-GAD-01',
    name: '108 Unit MH-GAD-01',
    patientName: 'Sunita Madavi (24y)',
    condition: 'Severe Post-Partum Hemorrhage',
    priority: 'CODE RED',
    speedKmH: 78,
    progress: 0.18,
    direction: 1,
    originName: 'Bhamragad Tribal PHC',
    destinationName: 'District Civil Hospital, Gadchiroli',
    hospitalId: 101,
    waypoints: [
      [19.3421, 80.3524], // Bhamragad PHC
      [19.3850, 80.2900],
      [19.4200, 80.2100],
      [19.4900, 80.1200],
      [19.5600, 80.0500],
      [19.6200, 79.9950]  // District Civil Hospital
    ],
    driverContact: '+91 98231 99108',
    color: '#e11d48'
  },
  {
    id: '108-TN-CHE-09',
    name: '108 Unit TN-CHE-09',
    patientName: 'Kavitha Raman (28y)',
    condition: 'Severe Pre-Eclampsia & Fetal Distress',
    priority: 'CODE RED',
    speedKmH: 65,
    progress: 0.45,
    direction: 1,
    originName: 'Mylapore Health Post',
    destinationName: 'Govt Maternity Hospital, Chennai',
    hospitalId: 2,
    waypoints: [
      [13.0337, 80.2673], // Mylapore
      [13.0480, 80.2520],
      [13.0620, 80.2480],
      [13.0721, 80.2589]  // Govt Maternity Hospital
    ],
    driverContact: '+91 98401 10809',
    color: '#e11d48'
  },
  {
    id: '108-MH-AMR-14',
    name: '108 Unit MH-AMR-14',
    patientName: 'Radha Bhil (21y)',
    condition: 'Obstructed Labor in Tribal Belt',
    priority: 'CODE ORANGE',
    speedKmH: 72,
    progress: 0.62,
    direction: 1,
    originName: 'Dharni Rural PHC',
    destinationName: 'District Hospital, Amravati',
    hospitalId: 103,
    waypoints: [
      [21.4328, 77.2185], // Dharni Melghat
      [21.3800, 77.3500],
      [21.3100, 77.4800],
      [21.2500, 77.6200],
      [21.1500, 77.7500],
      [20.9374, 77.7796]  // Amravati Civil Hospital
    ],
    driverContact: '+91 94221 10814',
    color: '#f59e0b'
  },
  {
    id: '108-TN-CBE-04',
    name: '108 Unit TN-CBE-04',
    patientName: 'Priya Sundaram (31y)',
    condition: 'Premature Rupture of Membranes',
    priority: 'CODE RED',
    speedKmH: 82,
    progress: 0.78,
    direction: 1,
    originName: 'Pollachi Rural Sub-Centre',
    destinationName: 'Coimbatore Govt Medical College',
    hospitalId: 7,
    waypoints: [
      [10.6582, 77.0078], // Pollachi
      [10.7800, 76.9900],
      [10.8900, 76.9800],
      [11.0018, 76.9628]  // Coimbatore GMC
    ],
    driverContact: '+91 98940 10804',
    color: '#e11d48'
  }
];

// Helper to calculate total polyline length and interpolate point along path
const interpolateAlongPath = (waypoints, progress) => {
  if (!waypoints || waypoints.length === 0) return { lat: 0, lng: 0, heading: 0, remainingKm: 0, totalKm: 0 };
  if (waypoints.length === 1) return { lat: waypoints[0][0], lng: waypoints[0][1], heading: 0, remainingKm: 0, totalKm: 0 };

  const haversineDist = (p1, p2) => {
    const R = 6371;
    const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
    const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1[0] * Math.PI) / 180) *
        Math.cos((p2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 1. Calculate segment lengths and cumulative distances
  const segmentLengths = [];
  let totalKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dist = haversineDist(waypoints[i], waypoints[i + 1]);
    segmentLengths.push(dist);
    totalKm += dist;
  }

  // 2. Find target distance based on progress fraction [0, 1]
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const targetDist = clampedProgress * totalKm;
  const remainingKm = Math.max(0, (1 - clampedProgress) * totalKm);

  // 3. Find specific segment
  let accumulated = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDist || i === segmentLengths.length - 1) {
      const segFraction = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
      const lng = p1[1] + (p2[1] - p1[1]) * segFraction;

      // Calculate heading angle
      const dLng = (p2[1] - p1[1]) * Math.cos(((p1[0] + p2[0]) / 2 * Math.PI) / 180);
      const dLat = p2[0] - p1[0];
      const headingRad = Math.atan2(dLng, dLat);
      const headingDeg = (headingRad * 180) / Math.PI;

      // Split waypoints into passed and remaining
      const passedPath = [...waypoints.slice(0, i + 1), [lat, lng]];
      const remainingPath = [[lat, lng], ...waypoints.slice(i + 1)];

      return {
        lat,
        lng,
        heading: headingDeg,
        remainingKm,
        totalKm,
        passedPath,
        remainingPath,
      };
    }
    accumulated += segLen;
  }

  return {
    lat: waypoints[waypoints.length - 1][0],
    lng: waypoints[waypoints.length - 1][1],
    heading: 0,
    remainingKm: 0,
    totalKm,
    passedPath: waypoints,
    remainingPath: [waypoints[waypoints.length - 1]],
  };
};

const LiveNetworkMap = ({ hospitals = [], onSelectHospital, selectedHospitalId }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const hospitalsLayerRef = useRef(null);
  const ashaLayerRef = useRef(null);
  const ambulanceLayerRef = useRef(null);
  const ambulanceTracksLayerRef = useRef(null);
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

  // Live Animated Ambulance Fleet State
  const [fleet, setFleet] = useState(INITIAL_FLEET_MISSIONS);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 4x
  const [focusedVehicleId, setFocusedVehicleId] = useState(null);

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
    ambulanceTracksLayerRef.current = L.layerGroup().addTo(map);
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

  // 6. Live Animation Ticker for 108 Ambulance Movement
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setFleet((prevFleet) =>
        prevFleet.map((vehicle) => {
          const step = (0.003 * simSpeed);
          let newProgress = vehicle.progress + step * vehicle.direction;
          let newDirection = vehicle.direction;

          // When vehicle reaches hospital, loop or turn around
          if (newProgress >= 1.0) {
            newProgress = 1.0;
            newDirection = -1; // return journey
          } else if (newProgress <= 0.0) {
            newProgress = 0.0;
            newDirection = 1; // forward emergency dispatch
          }

          return {
            ...vehicle,
            progress: newProgress,
            direction: newDirection,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // 7. Render Moving 108 Ambulances along Paths on Map
  useEffect(() => {
    if (!ambulanceLayerRef.current || !ambulanceTracksLayerRef.current) return;
    const ambLayer = ambulanceLayerRef.current;
    const trackLayer = ambulanceTracksLayerRef.current;

    ambLayer.clearLayers();
    trackLayer.clearLayers();

    if (!showAmbulances) return;

    fleet.forEach((veh) => {
      const pathState = interpolateAlongPath(veh.waypoints, veh.progress);
      const isReturning = veh.direction === -1;
      const etaMinutes = Math.max(1, Math.round((pathState.remainingKm / veh.speedKmH) * 60));
      const etaSeconds = Math.round(((pathState.remainingKm / veh.speedKmH) * 3600) % 60);

      // A. Draw Trailing Traveled Route (Cyan/Emerald Solid Glow)
      if (pathState.passedPath && pathState.passedPath.length > 1) {
        L.polyline(pathState.passedPath, {
          color: '#006b5f',
          weight: 4,
          opacity: 0.85,
        }).addTo(trackLayer);
      }

      // B. Draw Projected Remaining Route (Glowing Dashed Red)
      if (pathState.remainingPath && pathState.remainingPath.length > 1) {
        L.polyline(pathState.remainingPath, {
          color: veh.color || '#e11d48',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.75,
        }).addTo(trackLayer);
      }

      // C. Draw Animated Ambulance Marker with Siren Pulse
      const ambIconHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center transition-all duration-100">
          <span class="absolute -top-1 w-10 h-10 rounded-full bg-rose-500/40 animate-ping pointer-events-none"></span>
          <div style="transform: rotate(${Math.round(pathState.heading)}deg);" class="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-base hover:scale-125 transition-all">
            🚑
          </div>
          <div class="flex items-center gap-1 bg-slate-950/95 text-white border border-rose-500/50 px-2 py-0.5 rounded-full shadow-lg mt-1 whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span class="text-[9px] font-black tracking-tight font-mono text-rose-200">
              ${isReturning ? 'RTB' : `${etaMinutes}m ${etaSeconds}s`}
            </span>
          </div>
        </div>
      `;

      const customAmbIcon = L.divIcon({
        html: ambIconHtml,
        className: 'custom-moving-amb-marker',
        iconSize: [40, 52],
        iconAnchor: [20, 26],
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; width: 250px; line-height: 1.4; padding: 2px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #e11d48; font-size: 13px;">🚨 ${veh.name}</strong>
            <span style="background: #ffe4e6; color: #be123c; padding: 2px 6px; border-radius: 999px; font-size: 9px; font-weight: 800;">
              ${veh.priority}
            </span>
          </div>

          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
            <div style="font-size: 10px; color: #9f1239; font-weight: 800; text-transform: uppercase;">PATIENT ON BOARD</div>
            <strong style="color: #881337; font-size: 12px;">${veh.patientName}</strong><br/>
            <span style="font-size: 11px; color: #9f1239;">Condition: <strong>${veh.condition}</strong></span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px; font-size: 11px;">
            <div>
              <span style="font-size: 10px; color: #64748b; font-weight: 700;">CURRENT SPEED</span><br/>
              <strong style="color: #0f172a; font-size: 12px;">⚡ ${veh.speedKmH} km/h</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748b; font-weight: 700;">EST. ARRIVAL</span><br/>
              <strong style="color: #e11d48; font-size: 12px;">⏳ ${isReturning ? 'Returning' : `${etaMinutes}m ETA`}</strong>
            </div>
          </div>

          <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
            <strong>From:</strong> ${veh.originName}<br/>
            <strong>Destination:</strong> ${veh.destinationName} (~${pathState.remainingKm.toFixed(1)} km left)
          </div>

          <a 
            href="tel:${veh.driverContact}" 
            style="width: 100%; box-sizing: border-box; background: #e11d48; color: white; text-decoration: none; border-radius: 6px; padding: 6px; font-weight: 700; font-size: 11px; text-align: center; display: block;"
          >
            📞 Contact Driver (${veh.driverContact})
          </a>

        </div>
      `;

      const marker = L.marker([pathState.lat, pathState.lng], { icon: customAmbIcon })
        .addTo(ambLayer)
        .bindPopup(popupContent);

      // If user focused on this ambulance, follow it
      if (focusedVehicleId === veh.id && mapInstanceRef.current) {
        mapInstanceRef.current.panTo([pathState.lat, pathState.lng], { animate: true, duration: 0.1 });
      }
    });
  }, [fleet, showAmbulances, focusedVehicleId]);

  // Handler to spawn a quick simulated emergency dispatch
  const handleSpawnEmergencyMission = () => {
    const newMission = {
      id: `108-MH-DISPATCH-${Date.now().toString().slice(-4)}`,
      name: `108 Fast-Response Unit #${Math.floor(100 + Math.random() * 900)}`,
      patientName: 'Pooja Patil (26y)',
      condition: 'Imminent Delivery with Fetal Bradycardia',
      priority: 'CODE RED',
      speedKmH: 85,
      progress: 0.05,
      direction: 1,
      originName: 'Rural PHC Sub-Centre',
      destinationName: 'Sassoon General Hospital, Pune',
      hospitalId: 105,
      waypoints: [
        [18.5204, 73.8567],
        [18.5290, 73.8650],
        [18.5350, 73.8720],
        [18.5284, 73.8742]
      ],
      driverContact: '+91 98220 10899',
      color: '#e11d48'
    };

    setFleet((prev) => [newMission, ...prev]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.5204, 73.8567], 12, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col min-h-[460px] bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      
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
            <span className="animate-pulse">🚑</span>
            <span className="hidden sm:inline">108 Active Fleet ({fleet.length})</span>
          </button>

        </div>

        {/* Right Actions: Locate Me, Simulation Speed & Map Mode */}
        <div className="flex items-center gap-2">
          
          {/* Live Fleet Animation Controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                isSimulating ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
              }`}
              title={isSimulating ? 'Pause Live Fleet Simulation' : 'Resume Live Fleet Simulation'}
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden md:inline">{isSimulating ? 'Live' : 'Paused'}</span>
            </button>

            <button
              onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 4 : 1)}
              className="px-2 py-1 text-[10px] font-mono text-slate-600 hover:text-slate-900"
              title="Change Simulation Speed"
            >
              {simSpeed}x
            </button>
          </div>

          <button
            onClick={requestUserLocation}
            disabled={isLocating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            title="Locate My Live Position"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">{isLocating ? 'Locating...' : 'Locate Me'}</span>
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

      {/* Quick Trigger Emergency Dispatch Floating Action Banner */}
      <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2">
        <button
          onClick={handleSpawnEmergencyMission}
          className="px-3 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs rounded-xl shadow-lg border border-rose-400/40 flex items-center gap-2 backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span>Simulate Instant 108 Emergency Dispatch</span>
        </button>
      </div>

      {/* Actual Interactive Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full flex-1 z-0 relative min-h-[380px]" 
        style={{ minHeight: '380px' }}
      />

    </div>
  );
};

export default LiveNetworkMap;
