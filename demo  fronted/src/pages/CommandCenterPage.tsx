import React, { useState, useEffect } from 'react';
import { TopNavBar } from '../components/common/TopNavBar';
import { SideNavBar } from '../components/common/SideNavBar';
import { LiveNetworkMap } from '../components/command/LiveNetworkMap';
import { RoutingPanel } from '../components/command/RoutingPanel';
import { ActiveMissions } from '../components/command/ActiveMissions';
import { CapacityTable } from '../components/command/CapacityTable';
import { EmergencyLocationModal } from '../components/common/EmergencyLocationModal';
import { HospitalService } from '../services/api';
import { Hospital, RouteResponse } from '../types';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { calculateDistanceKm, findBestHospitalFromLocation, formatEta } from '../services/navigation';

export const CommandCenterPage: React.FC = () => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [recommendedHospitalId, setRecommendedHospitalId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [routingState, setRoutingState] = useState<'INITIAL' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR'>('LOADING');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [routingError, setRoutingError] = useState<string>('Unable to calculate route');
  const { t, language } = useThemeLanguage();

  useEffect(() => {
    loadHospitalDataAndFetchLocation();
  }, []);

  const loadHospitalDataAndFetchLocation = async () => {
    try {
      const data = await HospitalService.getAll();
      setHospitals(data);

      // 1. Fetch Starting Point from Device Location Service (GPS)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userCoords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            };
            handleUserLocationSelected(userCoords, data);
          },
          (err) => {
            console.warn('Geolocation service unavailable or denied, fallback to default sector:', err);
            // Default to central Maharashtra sector (19.0400, 72.8530)
            const fallbackCoords = { lat: 19.0400, lng: 72.8530 };
            handleUserLocationSelected(fallbackCoords, data);
          },
          { timeout: 6000, enableHighAccuracy: true }
        );
      } else {
        const fallbackCoords = { lat: 19.0400, lng: 72.8530 };
        handleUserLocationSelected(fallbackCoords, data);
      }
    } catch (err) {
      console.error('Failed to load hospitals for command center:', err);
      setRoutingState('ERROR');
    }
  };

  const handleUserLocationSelected = (originCoords: { lat: number; lng: number }, hospitalList: Hospital[] = hospitals) => {
    setUserLocation(originCoords);
    setSelectedOriginId(null);

    const list = hospitalList.length > 0 ? hospitalList : hospitals;
    const match = findBestHospitalFromLocation(originCoords.lat, originCoords.lng, list);

    if (match) {
      const destHospital = match.hospital;
      setSelectedDestinationId(destHospital.id);
      setRecommendedHospitalId(destHospital.id);
      setRoutingState('SUCCESS');

      setRouteData({
        origin_hospital_id: 'USER-LOCATION',
        recommended_hospital_id: destHospital.id,
        recommended: {
          id: destHospital.id,
          name: destHospital.name,
          eta: formatEta(match.estimatedMinutes, language),
          distance: `${match.distanceKm} km`,
          available_beds: destHospital.available_beds,
          available_icu_beds: destHospital.availableIcuBeds
        },
        alternatives: list
          .filter(h => h.id !== destHospital.id && h.available_beds > 0)
          .slice(0, 2)
          .map(h => {
            const distKm = calculateDistanceKm(originCoords.lat, originCoords.lng, h.lat || 19.0, h.lng || 73.0);
            return {
              id: h.id,
              name: h.name,
              eta_diff: '+6m',
              distance: `${distKm} km`,
              available_beds: h.available_beds
            };
          }),
        skipped: list
          .filter(h => h.available_beds === 0 || h.status === 'DIVERT')
          .map(h => ({
            id: h.id,
            name: h.name,
            reason: 'Zero bed capacity'
          }))
      });
    } else {
      setRoutingState('EMPTY');
    }
  };

  const handleSelectOrigin = async (originId: string) => {
    setUserLocation(null);
    setSelectedOriginId(originId);
    setRoutingState('LOADING');
    setRouteData(null);
    setRecommendedHospitalId(null);
    setSelectedDestinationId(null);

    try {
      const response = await HospitalService.calculateRoute(originId);
      setRouteData(response);
      if (response && response.recommended_hospital_id) {
        setRecommendedHospitalId(response.recommended_hospital_id);
        setSelectedDestinationId(response.recommended_hospital_id);
        setRoutingState('SUCCESS');
      } else {
        setRoutingState('EMPTY');
      }
    } catch (err: any) {
      console.error('Routing calculation failed:', err);
      setRoutingError(err.message || (language === 'mr' ? 'मार्ग शोधण्यात अयशस्वी' : language === 'hi' ? 'मार्ग गणना में विफल' : 'Unable to calculate route'));
      setRoutingState('ERROR');
    }
  };

  const handleSelectDestination = (destId: string) => {
    const dest = hospitals.find(h => h.id === destId);
    if (!dest) return;

    setSelectedDestinationId(destId);
    setRecommendedHospitalId(destId);

    const originHosp = hospitals.find(h => h.id === selectedOriginId);
    const startLat = userLocation?.lat || originHosp?.lat;
    const startLng = userLocation?.lng || originHosp?.lng;

    let dist = '6.4 km';
    let eta = '14 mins';

    if (startLat && startLng && dest.lat && dest.lng) {
      const distKm = calculateDistanceKm(startLat, startLng, dest.lat, dest.lng);
      const mins = Math.max(3, Math.round((distKm / 35) * 60));
      dist = `${distKm} km`;
      eta = formatEta(mins, language);
    }

    setRouteData(prev => ({
      origin_hospital_id: userLocation ? 'USER-LOCATION' : selectedOriginId || 'MH-MUM-03',
      recommended_hospital_id: destId,
      recommended: {
        id: dest.id,
        name: dest.name,
        eta,
        distance: dist,
        available_beds: dest.available_beds,
        available_icu_beds: dest.availableIcuBeds
      },
      alternatives: prev?.alternatives || hospitals
        .filter(h => h.id !== destId && h.available_beds > 0)
        .slice(0, 2)
        .map(h => ({
          id: h.id,
          name: h.name,
          eta_diff: '+6m',
          distance: '8.2 km',
          available_beds: h.available_beds
        })),
      skipped: prev?.skipped || []
    }));
    setRoutingState('SUCCESS');
  };

  const handleRetryRoute = () => {
    if (userLocation) {
      handleUserLocationSelected(userLocation, hospitals);
    } else if (selectedOriginId) {
      handleSelectOrigin(selectedOriginId);
    } else {
      loadHospitalDataAndFetchLocation();
    }
  };

  return (
    <div className="bg-background dark:bg-slate-950 text-on-surface min-h-screen flex flex-col md:flex-row transition-colors">
      <SideNavBar
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-[280px] w-full min-h-screen">
        <TopNavBar onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)} />

        <main className="p-4 md:p-margin-page flex-1 flex flex-col w-full max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-primary dark:text-slate-100 tracking-tight">
                {t('commandCenterTitle')}
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                {t('commandCenterSub')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Emergency GPS SOS Button */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-3.5 py-2 bg-error hover:bg-error/90 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 animate-pulse"
              >
                <span className="material-symbols-outlined text-[18px]">home_pin</span>
                <span>{language === 'mr' ? 'घरून थेट रुग्णालय मार्ग' : language === 'hi' ? 'घर से सीधा अस्पताल मार्ग' : 'My Location GPS Route'}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 border-l border-surface-border dark:border-slate-800 pl-3">
                <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-ping" />
                <span className="text-[11px] font-mono font-bold text-status-success uppercase tracking-wider">
                  {t('telemetrySync')}
                </span>
              </div>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 p-4 rounded-xl shadow-xs relative">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-primary-container dark:text-slate-400 uppercase tracking-wider">
                  {t('networkEfficiency')}
                </span>
                <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-sm">
                  trending_up
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">89.4%</span>
                <span className="text-xs text-status-success font-bold">+2.1%</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 p-4 rounded-xl shadow-xs relative">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-primary-container dark:text-slate-400 uppercase tracking-wider">
                  {t('activeDispatches')}
                </span>
                <span className="material-symbols-outlined text-teal-accent text-sm">ambulance</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">12</span>
                <span className="text-xs text-on-surface-variant dark:text-slate-400">{t('inTransit')}</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 p-4 rounded-xl shadow-xs relative">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-primary-container dark:text-slate-400 uppercase tracking-wider">
                  {t('availableIcu')}
                </span>
                <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-sm">
                  lock_open
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">32</span>
                <span className="text-xs text-on-surface-variant dark:text-slate-400">{t('bedsReserved')}</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 p-4 rounded-xl shadow-xs relative">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-primary-container dark:text-slate-400 uppercase tracking-wider">
                  {t('emergencyDiversions')}
                </span>
                <span className="material-symbols-outlined text-error text-sm">
                  error
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold font-mono text-error">1</span>
                <span className="text-xs text-error font-medium">{t('divertActive')}</span>
              </div>
            </div>
          </div>

          {/* Central Map & Operations Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Map */}
            <div className="lg:col-span-8 h-[540px] flex flex-col">
              <LiveNetworkMap
                hospitals={hospitals}
                selectedOriginId={selectedOriginId}
                recommendedHospitalId={recommendedHospitalId}
                userLocation={userLocation}
                onSelectOrigin={handleSelectOrigin}
                isLoading={routingState === 'LOADING'}
              />
            </div>

            {/* Right 4 Cols: Routing & Active Missions Stack */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <RoutingPanel
                state={routingState}
                routeData={routeData}
                hospitals={hospitals}
                selectedOriginId={selectedOriginId}
                selectedDestinationId={selectedDestinationId}
                userCoords={userLocation}
                onSelectOrigin={handleSelectOrigin}
                onSelectDestination={handleSelectDestination}
                onTriggerMyLocation={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => handleUserLocationSelected({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                      () => handleUserLocationSelected({ lat: 19.0400, lng: 72.8530 })
                    );
                  }
                }}
                errorMessage={routingError}
                onRetry={handleRetryRoute}
              />

              <ActiveMissions />
            </div>
          </div>

          {/* Bottom Full-Width Section: Capacity Table */}
          <div className="w-full">
            <CapacityTable
              hospitals={hospitals}
              onSelectHospital={(h) => handleSelectOrigin(h.id)}
            />
          </div>
        </main>
      </div>

      {/* Emergency GPS Location to Hospital Modal */}
      <EmergencyLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        hospitals={hospitals}
        onSelectHospitalRoute={(coords) => handleUserLocationSelected(coords)}
      />
    </div>
  );
};
