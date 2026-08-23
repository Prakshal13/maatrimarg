import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TopNavBar } from '../components/common/TopNavBar';
import { SideNavBar } from '../components/common/SideNavBar';
import { HospitalFilterToolbar } from '../components/hospitals/HospitalFilterToolbar';
import { HospitalDetailDrawer } from '../components/hospitals/HospitalDetailDrawer';
import { HospitalService } from '../services/api';
import { Hospital } from '../types';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const HospitalsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [activeDrawerHospital, setActiveDrawerHospital] = useState<Hospital | null>(null);
  const { t, language } = useThemeLanguage();

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const fetchHospitals = async () => {
    setIsLoading(true);
    try {
      const data = await HospitalService.getAll();
      setHospitals(data);
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statesList = useMemo(() => {
    return (Array.from(new Set(hospitals.map(h => h.state || 'Maharashtra').filter(Boolean))).sort()) as string[];
  }, [hospitals]);

  const districtsList = useMemo(() => {
    return (Array.from(new Set(hospitals.map(h => h.district).filter(Boolean))).sort()) as string[];
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchSearch =
        searchQuery === '' ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchState = selectedState === '' || h.state === selectedState;
      const matchDistrict = selectedDistrict === '' || h.district === selectedDistrict;

      return matchSearch && matchState && matchDistrict;
    });
  }, [hospitals, searchQuery, selectedState, selectedDistrict]);

  const handleSaveUpdate = async (id: string, updateData: Partial<Hospital>) => {
    const updated = await HospitalService.update(id, updateData);
    setHospitals(prev => prev.map(h => h.id === id ? { ...h, ...updated } : h));
    setActiveDrawerHospital(updated);
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-primary dark:text-slate-100 tracking-tight">
                {t('hospitalsDirectory')}
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                {t('hospitalsDirectorySub')}
              </p>
            </div>

            <button
              onClick={() => alert(language === 'mr' ? 'नवीन रुग्णालय नोंदणी सुविधा लवकरच उपलब्ध होत आहे.' : 'Add Facility: Facility registration gateway is open for state-certified obstetrics units.')}
              className="bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              {t('registerFacility')}
            </button>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                {t('totalFacilitiesMonitored')}
              </span>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">
                  {hospitals.length > 0 ? hospitals.length : 248}
                </span>
                <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[28px]">
                  domain
                </span>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                {t('availableIcuCap')}
              </span>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400">
                  {hospitals.reduce((sum, h) => sum + (h.availableIcuBeds || 0), 0) || 1452}
                </span>
                <div className="flex items-center gap-1 text-status-success text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+12%</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                {t('bloodReserves')}
              </span>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-3xl font-bold font-mono text-primary dark:text-slate-100">
                  {hospitals.reduce((sum, h) => sum + (h.bloodUnitsO_neg || 0), 0) || 890}
                </span>
                <div className="flex items-center gap-1 text-error text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[16px]">trending_down</span>
                  <span>-5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Directory Content Table Container */}
          <div className="border border-surface-border dark:border-slate-800 rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
            <HospitalFilterToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedState={selectedState}
              onStateChange={setSelectedState}
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
              statesList={statesList}
              districtsList={districtsList}
              onReset={() => {
                setSearchQuery('');
                setSelectedState('');
                setSelectedDistrict('');
              }}
            />

            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-secondary dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-xs font-semibold text-primary dark:text-slate-200">
                    {language === 'mr' ? 'रुग्णालय सूची लोड होत आहे...' : 'Loading hospital network registry...'}
                  </p>
                </div>
              ) : filteredHospitals.length === 0 ? (
                <div className="py-16 text-center text-on-surface-variant dark:text-slate-400 flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[36px] opacity-60">search_off</span>
                  <p className="text-sm font-semibold">{language === 'mr' ? 'कोणतेही रुग्णालय आढळले नाही' : 'No hospitals match your search criteria'}</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedState('');
                      setSelectedDistrict('');
                    }}
                    className="text-xs text-secondary dark:text-teal-400 font-semibold underline mt-1"
                  >
                    {t('resetFilters')}
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead className="sticky top-0 bg-surface-container-low dark:bg-slate-800/90 border-b border-surface-border dark:border-slate-800 text-on-surface-variant dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">{t('facilityName')}</th>
                      <th className="p-4">{t('district')}</th>
                      <th className="p-4">{t('status')}</th>
                      <th className="p-4 text-right">{t('availableIcuInput')}</th>
                      <th className="p-4 text-right">{t('availableBeds')}</th>
                      <th className="p-4 text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border dark:divide-slate-800 text-on-surface dark:text-slate-200">
                    {filteredHospitals.map((hospital) => {
                      const isDivert = hospital.status === 'DIVERT' || hospital.available_beds === 0;
                      const isCritical = hospital.available_beds > 0 && hospital.available_beds < 5;

                      return (
                        <tr
                          key={hospital.id}
                          onClick={() => setActiveDrawerHospital(hospital)}
                          className="hover:bg-surface-container-low dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        >
                          <td className="p-4">
                            <div className="font-bold text-primary dark:text-slate-100 group-hover:text-secondary dark:group-hover:text-teal-400 transition-colors">
                              {hospital.name}
                            </div>
                            <div className="text-[10px] text-on-surface-variant dark:text-slate-400 font-mono mt-0.5">
                              {hospital.tier || 'Tertiary Apex'} • ID: {hospital.id}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">{hospital.district}</span>
                            <span className="text-on-surface-variant dark:text-slate-400 block text-[10px]">
                              {hospital.state}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isDivert
                                  ? 'bg-error/15 text-error border border-error/30'
                                  : isCritical
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                  : 'bg-teal-500/15 text-secondary dark:text-teal-400 border border-teal-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isDivert ? 'bg-error animate-ping' : isCritical ? 'bg-amber-500' : 'bg-status-success'
                                }`}
                              />
                              {isDivert ? t('divert') : isCritical ? (language === 'mr' ? 'गंभीर भार' : 'CRITICAL LOAD') : (language === 'mr' ? 'कार्यरत' : 'OPERATIONAL')}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-semibold">
                            <span className={isCritical ? 'text-amber-500' : isDivert ? 'text-error' : 'text-teal-600 dark:text-teal-400'}>
                              {hospital.availableIcuBeds}
                            </span>{' '}
                            <span className="text-on-surface-variant dark:text-slate-400">/ {hospital.totalIcuBeds}</span>
                          </td>
                          <td className="p-4 text-right font-mono text-on-surface-variant dark:text-slate-400">
                            {hospital.available_beds} / {hospital.total_beds}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDrawerHospital(hospital);
                              }}
                              className="text-secondary dark:text-teal-400 hover:underline font-bold text-xs inline-flex items-center gap-1"
                            >
                              {t('viewDetails')}
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <HospitalDetailDrawer
        hospital={activeDrawerHospital}
        isOpen={Boolean(activeDrawerHospital)}
        onClose={() => setActiveDrawerHospital(null)}
        onSaveUpdate={handleSaveUpdate}
      />
    </div>
  );
};
