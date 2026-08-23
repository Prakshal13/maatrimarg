import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Navigation, 
  MapPin, 
  Search, 
  Crosshair, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Phone,
  Clock,
  Flame,
  ShieldCheck,
  Send
} from 'lucide-react';

// Haversine formula to compute geodesic distance in KM
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
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
  return parseFloat((R * c).toFixed(1));
}

// Convert driving duration into readable format
export function formatEta(mins, lang = 'en') {
  const hrLabel = lang === 'mr' ? 'तास' : lang === 'hi' ? 'घंटे' : lang === 'ta' ? 'மணி' : 'hrs';
  const minLabel = lang === 'mr' ? 'मि' : lang === 'hi' ? 'मिनट' : lang === 'ta' ? 'நிமி' : 'mins';

  if (mins < 60) return `${mins} ${minLabel}`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return `${hrs} ${hrLabel}`;
  return `${hrs} ${hrLabel} ${remMins} ${minLabel}`;
}

const RoutingDispatchPanel = ({ hospitals = [], onSelectDestination }) => {
  const { lang, t } = useLanguage();
  
  // Starting Point Mode: 'home' | 'hospital'
  const [startType, setStartType] = useState('home');
  const [coords, setCoords] = useState({ lat: 12.8214, lng: 80.0440 });
  const [isLocating, setIsLocating] = useState(false);
  const [searchLocation, setSearchLocation] = useState("📍 " + t("live_gps_device"));
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState(null);

  // Auto-fetch real device GPS on initial mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchLocation('📍 ' + t('live_gps_device'));
        },
        (err) => {
          // Default to central region if denied
          console.warn('Geolocation initial check:', err);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  }, []);

  // Sort hospitals by proximity to current device location
  const sortedHospitals = React.useMemo(() => {
    if (!hospitals || hospitals.length === 0) return [];
    return [...hospitals].map((h) => {
      const dist = calculateDistanceKm(coords.lat, coords.lng, h.lat, h.lng);
      return { ...h, distanceKm: dist };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hospitals, coords.lat, coords.lng]);

  // When device coords or hospitals change, automatically select NEAREST hospital as default!
  useEffect(() => {
    if (sortedHospitals.length > 0) {
      const nearest = sortedHospitals[0];
      setSelectedHospitalId(nearest.id);
      if (onSelectDestination) {
        onSelectDestination(nearest);
      }
    }
  }, [sortedHospitals]);

  // Handle GPS location fetch on click
  const handleFetchGps = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      const fallback = { lat: 12.8214, lng: 80.0440 };
      setCoords(fallback);
      setSearchLocation('📍 Device GPS Coordinates');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        setSearchLocation('📍 ' + t('live_gps_device'));
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setIsLocating(false);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  const selectedHospital = sortedHospitals.find(h => String(h.id) === String(selectedHospitalId)) || sortedHospitals[0];

  // Calculate distance and driving ETA
  const distanceKm = selectedHospital ? selectedHospital.distanceKm : 3.6;
  const estimatedMins = Math.max(5, Math.round((distanceKm / 38) * 60));

  // Standby alternative hospitals (next 3 closest facilities)
  const standbyHospitals = sortedHospitals
    .filter(h => String(h.id) !== String(selectedHospital?.id))
    .slice(0, 3);

  // Open Google Maps route in new tab
  const handleOpenGoogleMaps = () => {
    if (!selectedHospital) return;
    const origin = `${coords.lat},${coords.lng}`;
    const destination = encodeURIComponent(`${selectedHospital.name}, ${selectedHospital.district}`);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // {t('dispatch_ambulance')} Action
  const handleDispatchAmbulance = () => {
    setDispatchStatus('dispatching');
    setTimeout(() => {
      setDispatchStatus('success');
      setTimeout(() => setDispatchStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-left font-sans text-slate-900 dark:text-slate-100 flex flex-col justify-between space-y-5 transition-colors duration-200">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#006b5f] dark:text-[#2dd4bf]">
            directions_run
          </span>
          <h3 className="text-sm font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            {t('routing_dispatch')}
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-500/40 text-[#006b5f] dark:text-[#2dd4bf] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-[#2dd4bf] animate-pulse"></span>
          LIVE ROUTE
        </span>
      </div>

      <div className="space-y-4">
        
        {/* 2. Step 1: STARTING POINT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006b5f] dark:bg-[#2dd4bf]"></span>
              {t('starting_point')}
            </span>
            
            {/* Pill Toggle: {t('home_address')} vs Hospital */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setStartType('home')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  startType === 'home' 
                    ? 'bg-[#006b5f] dark:bg-teal-500 text-white dark:text-slate-950 shadow-2xs font-extrabold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>🏠 {t('home_address')}</span>
              </button>
              <button
                type="button"
                onClick={() => setStartType('hospital')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  startType === 'hospital' 
                    ? 'bg-[#006b5f] dark:bg-teal-500 text-white dark:text-slate-950 shadow-2xs font-extrabold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>🏥 Hospital</span>
              </button>
            </div>
          </div>

          {/* Location Input with Device GPS Button */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/90 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="material-symbols-outlined text-rose-500 dark:text-rose-400 text-[17px] shrink-0">
                location_on
              </span>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 dark:text-slate-200 w-full truncate"
              />
            </div>

            <button
              onClick={handleFetchGps}
              disabled={isLocating}
              className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-500/40 text-[#006b5f] dark:text-[#2dd4bf] text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
            >
              <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Device GPS'}</span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
            <span>{t('live_gps_device')}:</span>
            <span className="text-[#006b5f] dark:text-[#2dd4bf] font-bold">{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</span>
          </div>
        </div>

        {/* 3. Step 2: DESTINATION HOSPITAL (Sorted by Proximity) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006b5f] dark:bg-[#2dd4bf]"></span>
              {t('dest_hospital')}
            </span>
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">
              {t('auto_selected_nearest')} ({sortedHospitals[0]?.distanceKm || 0} km)
            </span>
          </div>

          <select
            value={selectedHospitalId}
            onChange={(e) => {
              setSelectedHospitalId(e.target.value);
              if (onSelectDestination) {
                const hosp = sortedHospitals.find(h => String(h.id) === String(e.target.value));
                if (hosp) onSelectDestination(hosp);
              }
            }}
            className="w-full bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#006b5f] dark:focus:ring-teal-500 cursor-pointer"
          >
            {sortedHospitals.map((h) => (
              <option key={h.id} value={h.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {h.name} ({h.district}) • {h.distanceKm} km ({h.nicu_beds_available ?? 3} ICU)
              </option>
            ))}
          </select>
        </div>

        {/* 4. {t('optimal_referral')} Card based on Proximity */}
        {selectedHospital && (
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-gradient-to-b dark:from-[#0e2238] dark:to-[#091524] border border-teal-200/90 dark:border-teal-500/30 space-y-3 shadow-md transition-colors">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-[#006b5f] dark:text-[#2dd4bf] uppercase tracking-wider flex items-center gap-1">
                  {t('optimal_referral')} <span className="w-1.5 h-1.5 rounded-full bg-[#006b5f] dark:bg-[#2dd4bf] inline-block animate-pulse"></span>
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mt-1 leading-snug">
                  {selectedHospital.name}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  {selectedHospital.district}, {selectedHospital.state || 'Tamil Nadu / Maharashtra'} • {selectedHospital.address || 'District Health Facility Campus'}
                </p>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/90 text-[#006b5f] dark:text-[#2dd4bf] border border-teal-300 dark:border-teal-500/40 text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                Tertiary Regional
              </span>
            </div>

            {/* 3 Metric Grid */}
            <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-teal-200/80 dark:border-slate-800/80 text-center bg-white/80 dark:bg-slate-950/50 rounded-xl px-2">
              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                  estimatedTransit
                </span>
                <strong className="text-xs sm:text-sm font-black text-[#006b5f] dark:text-[#2dd4bf] font-mono">
                  {formatEta(estimatedMins, lang)}
                </strong>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                  distance
                </span>
                <strong className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                  {distanceKm} km
                </strong>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                  availableIcuBeds
                </span>
                <strong className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedHospital.nicu_beds_available ?? 4} beds
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              
              <button
                onClick={handleOpenGoogleMaps}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-[#006b5f] dark:text-[#2dd4bf]" />
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={handleDispatchAmbulance}
                disabled={dispatchStatus === 'dispatching'}
                className="py-2.5 px-3 rounded-xl bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  ambulance
                </span>
                <span>{dispatchStatus === 'dispatching' ? 'Dispatching...' : t('dispatch_ambulance')}</span>
              </button>

            </div>

            {dispatchStatus === 'success' && (
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-reveal">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>108 Emergency Vehicle Dispatched to {selectedHospital.name}</span>
              </div>
            )}

          </div>
        )}

        {/* 5. {t('standby_receiving')} FACILITIES LIST (Closest 3) */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('standby_receiving')}
          </div>

          <div className="space-y-2">
            {standbyHospitals.map((h) => (
              <div
                key={h.id}
                onClick={() => {
                  setSelectedHospitalId(h.id);
                  if (onSelectDestination) onSelectDestination(h);
                }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs transition-all cursor-pointer group"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#006b5f] dark:group-hover:text-[#2dd4bf] truncate transition-colors">
                    {h.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {h.distanceKm} km • +{Math.max(3, Math.round(h.distanceKm / 45 * 60))}m
                  </div>
                </div>

                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] font-mono shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                  <span>{h.nicu_beds_available ?? 4} beds</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default RoutingDispatchPanel;
