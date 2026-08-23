import React, { useState, useEffect } from 'react';
import { Hospital } from '../../types';
import { findBestHospitalFromLocation, calculateDistanceKm, formatEta } from '../../services/navigation';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface EmergencyLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  onSelectHospitalRoute?: (originCoords: { lat: number; lng: number }, destinationHospital: Hospital) => void;
}

export const EmergencyLocationModal: React.FC<EmergencyLocationModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  onSelectHospitalRoute
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [bestMatch, setBestMatch] = useState<{
    hospital: Hospital;
    distanceKm: number;
    estimatedMinutes: number;
    googleMapsUrl: string;
  } | null>(null);

  const { language } = useThemeLanguage();

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      // Fallback: Mumbai default location
      const fallback = { lat: 19.0400, lng: 72.8530 };
      setCoords(fallback);
      processLocation(fallback.lat, fallback.lng);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        processLocation(userLat, userLng);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        // Seamless fallback to Maharashtra urban center (Dharavi / Central Mumbai)
        const fallback = { lat: 19.0400, lng: 72.8530 };
        setCoords(fallback);
        processLocation(fallback.lat, fallback.lng);
        setLocationError(
          language === 'mr'
            ? 'GPS परवानगी नाकारली गेली. मध्यवर्ती मुंबई स्थान वापरले जात आहे.'
            : language === 'hi'
            ? 'जीपीएस अनुमति अस्वीकृत। केंद्रीय मुंबई स्थान का उपयोग किया जा रहा है।'
            : 'GPS permission denied. Using central Maharashtra sector coordinates.'
        );
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const processLocation = (lat: number, lng: number) => {
    const result = findBestHospitalFromLocation(lat, lng, hospitals);
    if (result) {
      setBestMatch(result);
      setSelectedDestId(result.hospital.id);
      if (onSelectHospitalRoute) {
        onSelectHospitalRoute({ lat, lng }, result.hospital);
      }
    }
  };

  const handleDestinationChange = (destId: string) => {
    setSelectedDestId(destId);
    const chosenHosp = hospitals.find(h => h.id === destId);
    if (!chosenHosp || !chosenHosp.lat || !chosenHosp.lng) return;

    const userLat = coords?.lat || 19.0400;
    const userLng = coords?.lng || 72.8530;

    const distKm = calculateDistanceKm(userLat, userLng, chosenHosp.lat, chosenHosp.lng);
    const mins = Math.max(4, Math.round((distKm / 35) * 60));
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${chosenHosp.lat},${chosenHosp.lng}&travelmode=driving`;

    setBestMatch({
      hospital: chosenHosp,
      distanceKm: distKm,
      estimatedMinutes: mins,
      googleMapsUrl
    });

    if (onSelectHospitalRoute && coords) {
      onSelectHospitalRoute(coords, chosenHosp);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGetLocation();
    }
  }, [isOpen, hospitals]);

  if (!isOpen) return null;

  const handleOpenGoogleMaps = () => {
    if (bestMatch?.googleMapsUrl) {
      window.open(bestMatch.googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl shadow-2xl p-6 z-10 animate-reveal overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-surface-border dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-error-container/30 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">home_pin</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-primary dark:text-slate-100">
                {language === 'mr'
                  ? 'घरून थेट रुग्णालयाचा सर्वात वेगवान मार्ग'
                  : language === 'hi'
                  ? 'घर से अस्पताल का सबसे तेज़ एवं सुरक्षित मार्ग'
                  : 'Fastest Route from Home to Hospital'}
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">
                {language === 'mr'
                  ? 'आरंभ व गंतव्य निवडून गुगल मॅप्सवर थेट नेव्हिगेशन सुरू करा'
                  : language === 'hi'
                  ? 'आरंभ एवं गंतव्य चुनकर गूगल मैप्स पर सीधा नेविगेशन शुरू करें'
                  : 'Select starting & destination point to launch Google Maps navigation'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* GPS Location Status Box */}
        <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-800/80 border border-surface-border dark:border-slate-700 flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <div>
              <span className="font-semibold text-primary dark:text-slate-200 block">
                {coords
                  ? `${language === 'mr' ? 'आरंभ स्थान ओळखले' : language === 'hi' ? 'आरंभिक स्थान प्राप्त' : 'Starting Location'} (${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E)`
                  : language === 'mr'
                  ? 'स्थान शोधत आहे...'
                  : language === 'hi'
                  ? 'स्थान खोजा जा रहा है...'
                  : 'Detecting live GPS location...'}
              </span>
              <span className="text-[10px] text-on-surface-variant dark:text-slate-400">
                {language === 'mr' ? 'माझे घर / थेट GPS स्थान' : language === 'hi' ? 'मेरा घर / लाइव GPS स्थान' : 'My House / Live GPS Location'}
              </span>
            </div>
          </div>

          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="px-2.5 py-1 bg-surface-container-high dark:bg-slate-700 text-primary dark:text-slate-200 rounded-md font-semibold text-[11px] hover:bg-surface-container hover:text-teal-400 transition-colors flex items-center gap-1"
          >
            <span className={`material-symbols-outlined text-[14px] ${isLocating ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {language === 'mr' ? 'पुन्हा शोधा' : language === 'hi' ? 'पुनः खोजें' : 'Refetch'}
          </button>
        </div>

        {/* Destination Hospital Dropdown */}
        {hospitals.length > 0 && (
          <div className="mb-4 space-y-1">
            <label className="block text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
              {language === 'mr' ? 'गंतव्य रुग्णालय निवडा (Destination Hospital):' : language === 'hi' ? 'गंतव्य अस्पताल चुनें (Destination Hospital):' : 'Select Destination Hospital:'}
            </label>
            <select
              value={selectedDestId || ''}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-slate-800 border border-teal-500/40 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district}) • {h.availableIcuBeds} ICU • {h.available_beds} Beds
                </option>
              ))}
            </select>
          </div>
        )}

        {locationError && (
          <div className="p-2 mb-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px]">
            {locationError}
          </div>
        )}

        {/* Recommended Hospital Card */}
        {bestMatch ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/40 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary dark:text-teal-400 block mb-0.5">
                    {language === 'mr' ? 'गंतव्य रुग्णालय माहिती' : language === 'hi' ? 'गंतव्य अस्पताल विवरण' : 'Destination Hospital Details'}
                  </span>
                  <h4 className="text-sm font-bold text-primary dark:text-slate-100">
                    {bestMatch.hospital.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                    {bestMatch.hospital.district}, Maharashtra • {bestMatch.hospital.address}
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-status-success/20 text-status-success font-bold px-2 py-0.5 rounded-full border border-status-success/30">
                  {language === 'mr' ? 'उपलब्ध' : language === 'hi' ? 'उपलब्ध' : 'READY'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-teal-500/20 text-center">
                <div className="p-1 bg-surface-container-lowest/80 dark:bg-slate-900/80 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">{language === 'mr' ? 'अंदाजे वेळ' : language === 'hi' ? 'अनुमानित समय' : 'ETA'}</span>
                  <strong className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {formatEta(bestMatch.estimatedMinutes, language)}
                  </strong>
                </div>
                <div className="p-1 bg-surface-container-lowest/80 dark:bg-slate-900/80 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">{language === 'mr' ? 'अंतर' : language === 'hi' ? 'दूरी' : 'Distance'}</span>
                  <strong className="text-xs font-mono text-primary dark:text-slate-200">
                    {bestMatch.distanceKm} km
                  </strong>
                </div>
                <div className="p-1 bg-surface-container-lowest/80 dark:bg-slate-900/80 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">{language === 'mr' ? 'ICU खाटा' : language === 'hi' ? 'आईसीयू बेड' : 'ICU Beds'}</span>
                  <strong className="text-xs font-mono text-status-success">
                    {bestMatch.hospital.availableIcuBeds} Beds
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-teal-accent">emergency</span>
                  {language === 'mr' ? 'प्रसूती कक्ष सज्ज' : language === 'hi' ? 'लेबर वार्ड तैयार' : 'Labor OT Standby'}
                </span>
                {bestMatch.hospital.contactPhone && (
                  <a
                    href={`tel:${bestMatch.hospital.contactPhone}`}
                    className="font-mono text-secondary dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    {bestMatch.hospital.contactPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Direct Google Maps Action Button */}
            <button
              onClick={handleOpenGoogleMaps}
              className="w-full py-3 px-4 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm group"
            >
              <span className="material-symbols-outlined text-[20px]">
                navigation
              </span>
              <span>
                {language === 'mr'
                  ? 'गुगल मॅप्सवर सर्वात वेगवान मार्ग सुरू करा'
                  : language === 'hi'
                  ? 'गूगल मैप्स पर सबसे तेज़ मार्ग शुरू करें'
                  : 'Open Fastest Route in Google Maps'}
              </span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                open_in_new
              </span>
            </button>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-on-surface-variant dark:text-slate-400">
              {language === 'mr' ? 'जवळचे उपलब्ध रुग्णालय शोधत आहे...' : 'Finding closest emergency hospital...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
