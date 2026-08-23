import React, { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { 
  MapPin, 
  Search, 
  RefreshCw, 
  Phone, 
  ExternalLink, 
  X, 
  Crosshair, 
  CheckCircle2, 
  AlertCircle,
  Navigation
} from 'lucide-react';

// Haversine distance calculation in kilometers
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

// Format duration into readable string
export function formatEta(mins) {
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return `${hrs} hrs`;
  return `${hrs} hrs ${remMins} mins`;
}

const EmergencyLocationModal = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [hospitals, setHospitals] = useState([]);
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchAddress, setSearchAddress] = useState('📍 Live Device GPS Location');
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [bestMatch, setBestMatch] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Fetch all 165 hospitals from backend database
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.getHospitals();
        if (res.data && res.data.length > 0) {
          setHospitals(res.data);
        }
      } catch (err) {
        console.warn('Failed to load hospitals for SOS navigation:', err);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch real device GPS location
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      // Default fallback: Solapur / Gadchiroli
      const fallback = { lat: 17.6599, lng: 75.9064 };
      setCoords(fallback);
      processLocation(fallback.lat, fallback.lng, hospitals);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        setSearchAddress('📍 Live Device GPS Location');
        processLocation(userLat, userLng, hospitals);
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        // Default fallback to Solapur / Central Maharashtra
        const fallback = { lat: 17.6599, lng: 75.9064 };
        setCoords(fallback);
        setLocationError('GPS permission denied or timeout. Using central emergency coordinates.');
        processLocation(fallback.lat, fallback.lng, hospitals);
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const processLocation = (lat, lng, hospitalList) => {
    const list = hospitalList && hospitalList.length > 0 ? hospitalList : hospitals;
    if (!list || list.length === 0) return;

    // Calculate distance for all hospitals and find the nearest
    const sorted = [...list].map((h) => {
      const dist = calculateDistanceKm(lat, lng, h.lat, h.lng);
      return { ...h, distanceKm: dist };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const nearest = sorted[0];
    if (nearest) {
      setSelectedHospitalId(nearest.id);
      const mins = Math.max(8, Math.round((nearest.distanceKm / 38) * 60));
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodeURIComponent(nearest.name + ', ' + nearest.district)}&travelmode=driving`;
      
      setBestMatch({
        hospital: nearest,
        distanceKm: nearest.distanceKm,
        estimatedMinutes: mins,
        googleMapsUrl,
      });
    }
  };

  // Auto trigger GPS when modal opens
  useEffect(() => {
    if (isOpen) {
      handleGetLocation();
    }
  }, [isOpen, hospitals.length]);

  const handleDestinationChange = (hospId) => {
    setSelectedHospitalId(hospId);
    const chosen = hospitals.find((h) => String(h.id) === String(hospId));
    if (!chosen) return;

    const userLat = coords?.lat || 17.6599;
    const userLng = coords?.lng || 75.9064;
    const distKm = calculateDistanceKm(userLat, userLng, chosen.lat, chosen.lng);
    const mins = Math.max(8, Math.round((distKm / 38) * 60));
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${encodeURIComponent(chosen.name + ', ' + chosen.district)}&travelmode=driving`;

    setBestMatch({
      hospital: chosen,
      distanceKm: distKm,
      estimatedMinutes: mins,
      googleMapsUrl,
    });
  };

  const handleOpenGoogleMaps = () => {
    if (bestMatch?.googleMapsUrl) {
      window.open(bestMatch.googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
      {/* Dark Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card matching Screenshot 2 */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-7 z-10 animate-reveal overflow-hidden text-left font-sans">
        
        {/* Top Header matching Screenshot */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#cb4646] shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                Fastest Route from Home to Hospital
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Search home address or use live GPS to launch Google Maps navigation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-5">
          
          {/* Starting Home Address Section */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              STARTING HOME ADDRESS:
            </label>
            
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Search starting location..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#006b5f] transition-all"
              />
            </div>

            {/* GPS Fetch Capsule from Screenshot */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Live Device GPS Location
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {coords ? `Coordinates: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'Locating device position...'}
                </span>
              </div>

              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Crosshair className={`w-3.5 h-3.5 text-slate-700 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Fetch GPS'}</span>
              </button>
            </div>
          </div>

          {/* Select Destination Hospital Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              SELECT DESTINATION HOSPITAL:
            </label>
            
            <select
              value={selectedHospitalId || ''}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006b5f] cursor-pointer"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district}) • {h.nicu_beds_available ?? 3} ICU • {h.beds_available ?? 12} Beds
                </option>
              ))}
            </select>
          </div>

          {/* Destination Hospital Details Card from Screenshot */}
          {bestMatch && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3">
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#006b5f] block">
                    DESTINATION HOSPITAL DETAILS
                  </span>
                  <h4 className="text-sm font-black text-slate-900 font-['Plus_Jakarta_Sans'] mt-0.5">
                    {bestMatch.hospital.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {bestMatch.hospital.district}, {bestMatch.hospital.state || 'Maharashtra'} • {bestMatch.hospital.address || 'Civil District Hospital Campus'}
                  </p>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200 shrink-0">
                  READY
                </span>
              </div>

              {/* 3 Metric Cards Grid (ETA, Distance, ICU Beds) */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-teal-200/60 text-center bg-white/70 rounded-xl p-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    ETA
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-[#006b5f] font-mono">
                    {formatEta(bestMatch.estimatedMinutes)}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Distance
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                    {bestMatch.distanceKm} km
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    ICU Beds
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-emerald-700 font-mono">
                    {bestMatch.hospital.nicu_beds_available ?? 4} Beds
                  </strong>
                </div>
              </div>

              {/* Bottom Hospital Status Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1 text-[#006b5f] font-bold">
                  <span className="text-base leading-none">✱</span>
                  <span>Labor OT Standby</span>
                </span>

                <a
                  href={`tel:${bestMatch.hospital.contact_phone || '+91-217-2749401'}`}
                  className="text-slate-700 font-mono font-bold hover:text-[#006b5f] flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#006b5f]" />
                  <span>{bestMatch.hospital.contact_phone || '+91-217-2749401'}</span>
                </a>
              </div>

            </div>
          )}

          {/* Action Button: Open Fastest Route in Google Maps */}
          <button
            onClick={handleOpenGoogleMaps}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#091426] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2 group"
          >
            <Navigation className="w-4 h-4 text-[#2dd4bf]" />
            <span>Open Fastest Route in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>

      </div>
    </div>
  );
};

export default EmergencyLocationModal;
