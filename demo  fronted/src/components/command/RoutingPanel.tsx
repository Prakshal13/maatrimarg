import React, { useState } from 'react';
import { RouteResponse, Hospital } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { getGoogleMapsUrlForHospital, calculateDistanceKm, formatEta } from '../../services/navigation';

interface RoutingPanelProps {
  state: 'INITIAL' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR';
  routeData: RouteResponse | null;
  hospitals?: Hospital[];
  selectedOriginId?: string | null;
  selectedDestinationId?: string | null;
  userCoords?: { lat: number; lng: number } | null;
  onSelectOrigin?: (originId: string) => void;
  onSelectDestination?: (destId: string) => void;
  onTriggerMyLocation?: () => void;
  errorMessage?: string;
  onRetry?: () => void;
}

export const RoutingPanel: React.FC<RoutingPanelProps> = ({
  state,
  routeData,
  hospitals = [],
  selectedOriginId,
  selectedDestinationId,
  userCoords,
  onSelectOrigin,
  onSelectDestination,
  onTriggerMyLocation,
  errorMessage = 'Unable to calculate route',
  onRetry
}) => {
  const [showSkipped, setShowSkipped] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const { t, language } = useThemeLanguage();

  const handleDispatch = () => {
    setIsDispatched(true);
    setTimeout(() => setIsDispatched(false), 4000);
  };

  const originHospital = hospitals.find(h => h.id === selectedOriginId);
  const destHospital = selectedDestinationId
    ? hospitals.find(h => h.id === selectedDestinationId) || null
    : routeData?.recommended
    ? hospitals.find(h => h.id === routeData.recommended.id) || null
    : null;

  // Compute direct metrics between chosen origin & destination
  const customMetrics = React.useMemo(() => {
    if (!destHospital) return null;

    let originLat = userCoords?.lat || originHospital?.lat;
    let originLng = userCoords?.lng || originHospital?.lng;

    if (!originLat || !originLng || !destHospital.lat || !destHospital.lng) {
      return {
        eta: routeData?.recommended?.eta || '12 mins',
        distance: routeData?.recommended?.distance || '5.8 km'
      };
    }

    const distKm = calculateDistanceKm(originLat, originLng, destHospital.lat, destHospital.lng);
    const mins = Math.max(3, Math.round((distKm / 35) * 60));

    return {
      eta: formatEta(mins, language),
      distance: `${distKm} km`
    };
  }, [originHospital, destHospital, userCoords, routeData, language]);

  const handleOpenGoogleMaps = () => {
    if (destHospital) {
      const originParam = userCoords || originHospital || undefined;
      const url = getGoogleMapsUrlForHospital(destHospital, originParam);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-xl flex flex-col shadow-sm h-full min-h-[420px] overflow-hidden transition-colors">
      {/* Header with Origin & Destination Pickers */}
      <div className="p-4 border-b border-surface-border dark:border-slate-800 bg-secondary/5 dark:bg-slate-800/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-body-lg font-bold text-primary dark:text-slate-100 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[20px]">
              directions_run
            </span>
            {t('routingTitle')}
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary dark:text-teal-400 border border-secondary/30 font-mono">
            {language === 'mr' ? 'थेट मार्ग' : language === 'hi' ? 'सीधा मार्ग' : 'LIVE ROUTE'}
          </span>
        </div>

        {/* 1. Origin Selector */}
        {hospitals.length > 0 && onSelectOrigin && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {language === 'mr' ? '१. आरंभ स्थान (Starting Point):' : language === 'hi' ? '1. आरंभिक स्थान (Starting Point):' : '1. Starting Point:'}
              </span>
              {onTriggerMyLocation && (
                <button
                  type="button"
                  onClick={onTriggerMyLocation}
                  className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5 font-bold normal-case text-[10px]"
                >
                  <span className="material-symbols-outlined text-[13px]">my_location</span>
                  {language === 'mr' ? 'माझे घर / GPS' : language === 'hi' ? 'मेरा घर / GPS' : 'My Home (GPS)'}
                </button>
              )}
            </div>

            <select
              value={userCoords ? 'USER_GPS' : selectedOriginId || ''}
              onChange={(e) => {
                if (e.target.value === 'USER_GPS' && onTriggerMyLocation) {
                  onTriggerMyLocation();
                } else if (e.target.value) {
                  onSelectOrigin(e.target.value);
                }
              }}
              className="w-full bg-surface-container-lowest dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-on-surface dark:text-slate-200 outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 cursor-pointer"
            >
              {userCoords && (
                <option value="USER_GPS">
                  📍 {language === 'mr' ? 'माझे थेट स्थान / घर (GPS Location)' : language === 'hi' ? 'मेरा लाइव स्थान / घर (GPS Location)' : 'My Live House / Location (GPS)'}
                </option>
              )}
              <option value="" disabled>
                {language === 'mr' ? '-- आरंभिक रुग्णालय निवडा --' : language === 'hi' ? '-- आरंभिक अस्पताल चुनें --' : '-- Select Starting Facility --'}
              </option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Destination Hospital Dropdown */}
        {hospitals.length > 0 && onSelectDestination && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                {language === 'mr' ? '२. गंतव्य रुग्णालय (Destination Hospital):' : language === 'hi' ? '2. गंतव्य अस्पताल (Destination Hospital):' : '2. Destination Hospital:'}
              </span>
            </div>

            <select
              value={selectedDestinationId || routeData?.recommended_hospital_id || ''}
              onChange={(e) => {
                if (e.target.value) onSelectDestination(e.target.value);
              }}
              className="w-full bg-surface-container-lowest dark:bg-slate-800 border border-teal-500/40 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-on-surface dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
            >
              <option value="" disabled>
                {language === 'mr' ? '-- गंतव्य रुग्णालय निवडा --' : language === 'hi' ? '-- गंतव्य अस्पताल चुनें --' : '-- Select Destination Hospital --'}
              </option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district}) • {h.availableIcuBeds} ICU • {h.available_beds} beds
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 p-4 flex flex-col overflow-y-auto space-y-3">
        {state === 'LOADING' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 border-4 border-secondary dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-body-md font-bold text-primary dark:text-slate-100 text-sm">
              {t('calculatingRoute')}
            </p>
            <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-1 max-w-xs">
              {t('evaluatingRouteSub')}
            </p>
          </div>
        )}

        {state === 'ERROR' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-error-container/20 text-error flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px]">cloud_off</span>
            </div>
            <p className="text-body-md font-bold text-error text-sm">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-primary dark:bg-teal-500 text-white dark:text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {language === 'mr' ? 'पुन्हा मार्ग शोधा' : language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Routing'}
              </button>
            )}
          </div>
        )}

        {destHospital && (
          <div className="space-y-4 animate-reveal">
            {/* Active Destination Card with Live Google Maps Redirection */}
            <div className="p-4 bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/40 rounded-xl space-y-3 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary dark:text-teal-400 block mb-0.5">
                    {language === 'mr' ? 'निवडलेले गंतव्य रुग्णालय' : language === 'hi' ? 'चयनित गंतव्य अस्पताल' : 'Selected Destination Facility'}
                  </span>
                  <h4 className="text-sm font-bold text-primary dark:text-slate-100">
                    {destHospital.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-0.5">
                    {destHospital.district}, Maharashtra • {destHospital.address || 'Civil Hospital Sector'}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs ${
                    destHospital.available_beds === 0
                      ? 'bg-error/20 text-error'
                      : 'bg-teal-500/25 text-teal-900 dark:text-teal-300'
                  }`}
                >
                  {destHospital.available_beds === 0 ? t('divert') : t('fastestEta')}
                </span>
              </div>

              {/* ETA & Distance Summary */}
              {customMetrics && (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono py-2 border-y border-teal-500/20 text-secondary dark:text-teal-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    ETA: {customMetrics.eta}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">near_me</span>
                    {customMetrics.distance}
                  </div>
                </div>
              )}

              {/* Hospital Capacities */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-surface-container-lowest/80 dark:bg-slate-900/80 border border-surface-border dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">{t('availableIcuInput')}</span>
                  <strong className="text-sm font-mono text-teal-600 dark:text-teal-400">
                    {destHospital.availableIcuBeds} / {destHospital.totalIcuBeds} Beds
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-lowest/80 dark:bg-slate-900/80 border border-surface-border dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">{t('availableBeds')}</span>
                  <strong className="text-sm font-mono text-primary dark:text-slate-200">
                    {destHospital.available_beds} / {destHospital.total_beds} Beds
                  </strong>
                </div>
              </div>

              {/* Action Buttons: 1. Google Maps Navigation, 2. Emergency Dispatch */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {/* PRIMARY ACTION: GOOGLE MAPS DIRECT REDIRECT */}
                <button
                  onClick={handleOpenGoogleMaps}
                  className="flex-1 py-2.5 px-3 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5 group"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    navigation
                  </span>
                  <span>
                    {language === 'mr'
                      ? 'गुगल मॅप्सवर थेट मार्ग सुरू करा'
                      : language === 'hi'
                      ? 'गूगल मैप्स पर सीधा मार्ग शुरू करें'
                      : 'Fastest Route in Google Maps'}
                  </span>
                  <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">
                    open_in_new
                  </span>
                </button>

                <button
                  onClick={handleDispatch}
                  disabled={isDispatched}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs border ${
                    isDispatched
                      ? 'bg-status-success text-white border-status-success'
                      : 'bg-surface-container-lowest dark:bg-slate-800 text-on-surface dark:text-slate-200 border-surface-border dark:border-slate-700 hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isDispatched ? 'check_circle' : 'ambulance'}
                  </span>
                  <span>
                    {isDispatched
                      ? language === 'mr' ? 'डिस्पॅच सक्रिय!' : 'Dispatched!'
                      : language === 'mr' ? '108 अलर्ट' : '108 Alert'}
                  </span>
                </button>
              </div>
            </div>

            {/* Alternative Facilities */}
            {routeData?.alternatives && routeData.alternatives.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-slate-400 tracking-wider block mb-2">
                  {t('alternativeFacilities')}
                </span>
                <div className="space-y-2">
                  {routeData.alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => onSelectDestination?.(alt.id)}
                      className="flex justify-between items-center p-2.5 bg-surface-container-low dark:bg-slate-800/80 border border-surface-border dark:border-slate-700 rounded-lg text-xs cursor-pointer hover:border-secondary transition-all"
                    >
                      <div>
                        <span className="font-semibold text-primary dark:text-slate-200 block truncate max-w-[170px]">
                          {alt.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant dark:text-slate-400">
                          {alt.distance} • {alt.available_beds} beds
                        </span>
                      </div>
                      <span className="text-data-mono font-bold text-on-surface-variant dark:text-slate-300 bg-surface-container-lowest dark:bg-slate-700 px-2 py-1 rounded">
                        {alt.eta_diff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped Facilities Section */}
            {routeData?.skipped && routeData.skipped.length > 0 && (
              <div className="pt-2 border-t border-surface-border dark:border-slate-800">
                <button
                  onClick={() => setShowSkipped(!showSkipped)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 py-1"
                >
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-error">block</span>
                    {t('skippedFacilities')} ({routeData.skipped.length})
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    {showSkipped ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showSkipped && (
                  <div className="mt-2 space-y-1.5 animate-reveal">
                    {routeData.skipped.map((skip) => (
                      <div
                        key={skip.id}
                        className="p-2 bg-error/5 dark:bg-error/10 border border-error/15 rounded-lg text-[11px]"
                      >
                        <div className="font-semibold text-error">{skip.name}</div>
                        <div className="text-[10px] text-on-surface-variant dark:text-slate-400 mt-0.5">
                          {language === 'mr' ? 'कारण:' : language === 'hi' ? 'कारण:' : 'Reason:'} {skip.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
