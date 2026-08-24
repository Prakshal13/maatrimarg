import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppSidebar from '../components/AppSidebar';
import PortalHeader from '../components/PortalHeader';
import { 
  Hospital, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  X,
  RefreshCw,
  Building2,
  PhoneCall
} from 'lucide-react';

const HospitalDashboard = () => {
  const { lang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loading, setLoading] = useState(true);

  // Drawer State
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerViewMode, setDrawerViewMode] = useState('view'); // 'view' | 'edit'
  const [drawerForm, setDrawerForm] = useState({
    beds_available: 10,
    nicu_beds_available: 3,
    surgeon_on_duty: true,
    ambulance_available: true,
    stock_a_pos: 4,
    stock_a_neg: 1,
    stock_b_pos: 5,
    stock_b_neg: 2,
    stock_ab_pos: 3,
    stock_ab_neg: 1,
    stock_o_pos: 6,
    stock_o_neg: 2,
  });

  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getHospitals();
      const data = res.data || [];
      setHospitals(data);
      setFilteredHospitals(data);
      
      if (location.state?.openHospitalId) {
        const h = data.find(h => h.id === location.state.openHospitalId);
        if (h) {
          setSelectedHospital(h);
          setDrawerForm({
            beds_available: h.beds_available ?? 10,
            nicu_beds_available: h.nicu_beds_available ?? 3,
            surgeon_on_duty: Boolean(h.surgeon_on_duty),
            ambulance_available: Boolean(h.ambulance_available),
            stock_o_pos: h.stock_o_pos ?? 6,
            stock_o_neg: h.stock_o_neg ?? 2,
          });
          setDrawerOpen(true);
          window.history.replaceState({}, document.title);
        }
      }
    } catch (e) {
      console.warn('Could not fetch hospitals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.state?.openHospitalId]);

  // Filter effect
  useEffect(() => {
    let list = hospitals;
    if (selectedState) {
      list = list.filter(h => h.state === selectedState);
    }
    if (selectedDistrict) {
      list = list.filter(h => h.district === selectedDistrict);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h => 
        h.name.toLowerCase().includes(q) ||
        (h.district && h.district.toLowerCase().includes(q)) ||
        (h.village_area && h.village_area.toLowerCase().includes(q))
      );
    }
    setFilteredHospitals(list);
  }, [searchQuery, selectedState, selectedDistrict, hospitals]);

  const uniqueStates = Array.from(new Set(hospitals.map(h => h.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(
    (selectedState ? hospitals.filter(h => h.state === selectedState) : hospitals)
      .map(h => h.district)
      .filter(Boolean)
  ));

  const openDrawer = (h) => {
    setSelectedHospital(h);
    setDrawerForm({
      beds_available: h.beds_available ?? 10,
      nicu_beds_available: h.nicu_beds_available ?? 3,
      surgeon_on_duty: Boolean(h.surgeon_on_duty),
      ambulance_available: Boolean(h.ambulance_available),
      stock_a_pos: h.stock_a_pos ?? 4,
      stock_a_neg: h.stock_a_neg ?? 1,
      stock_b_pos: h.stock_b_pos ?? 5,
      stock_b_neg: h.stock_b_neg ?? 2,
      stock_ab_pos: h.stock_ab_pos ?? 3,
      stock_ab_neg: h.stock_ab_neg ?? 1,
      stock_o_pos: h.stock_o_pos ?? 6,
      stock_o_neg: h.stock_o_neg ?? 2,
    });
    setDrawerOpen(true);
  };

  const handleSaveCapacity = async (e) => {
    e.preventDefault();
    if (!selectedHospital) return;
    setSaving(true);
    try {
      await api.updateHospitalCapacity(selectedHospital.id, {
        beds_available: Number(drawerForm.beds_available),
        nicu_beds_available: Number(drawerForm.nicu_beds_available),
        surgeon_on_duty: Boolean(drawerForm.surgeon_on_duty),
        ambulance_available: Boolean(drawerForm.ambulance_available),
        stock_a_pos: Number(drawerForm.stock_a_pos),
        stock_a_neg: Number(drawerForm.stock_a_neg),
        stock_b_pos: Number(drawerForm.stock_b_pos),
        stock_b_neg: Number(drawerForm.stock_b_neg),
        stock_ab_pos: Number(drawerForm.stock_ab_pos),
        stock_ab_neg: Number(drawerForm.stock_ab_neg),
        stock_o_pos: Number(drawerForm.stock_o_pos),
        stock_o_neg: Number(drawerForm.stock_o_neg),
      });
      await fetchData();
      setDrawerOpen(false);
    } catch (err) {
      alert(t('hosp_update_error') + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const totalBeds = hospitals.reduce((acc, h) => acc + (h.beds_available || 0), 0);
  const totalNicu = hospitals.reduce((acc, h) => acc + (h.nicu_beds_available || 0), 0);
  const totalONeg = hospitals.reduce((acc, h) => acc + (h.stock_o_neg || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f7f9fb] dark:bg-slate-950">
        
        {/* Top Header */}
        <PortalHeader 
          title={t('hosp_title')} 
          subtitle={t('hosp_subtitle')} 
          badgeText={`165 ${t("total_facilities")}`} 
        />

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto text-left">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                {t('hosp_title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('hosp_subtitle')}
              </p>
            </div>

          </div>

          {/* 3 Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between transition-colors">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('total_facilities')}</span>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  {hospitals.length}
                </span>
                <span className="material-symbols-outlined text-[#006b5f] dark:text-teal-400 text-[28px]">
                  domain
                </span>
              </div>
            </div>

            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between transition-colors">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('icu_nicu_beds')}</span>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-black text-teal-700 dark:text-teal-400 font-['Plus_Jakarta_Sans']">
                  {totalNicu}
                </span>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{t('capacity_increase')}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between transition-colors">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('blood_units_o_neg')}</span>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-['Plus_Jakarta_Sans']">
                  {totalONeg}
                </span>
                <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('live_synced')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Directory Toolbar & Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
            
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t('filters_label')}
                  </span>
                </div>
                
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hosp_search_placeholder')}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#006b5f] placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#006b5f] cursor-pointer"
                >
                  <option value="">{t('all_states')}</option>
                  {uniqueStates.map((s) => (
                    <option key={s} value={s}>{t(`state_${s}`) || s}</option>
                  ))}
                </select>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#006b5f] cursor-pointer"
                >
                  <option value="">{t('all_districts')} ({uniqueDistricts.length})</option>
                  {uniqueDistricts.map((d) => (
                    <option key={d} value={d}>{t(`district_${d}`) || d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">{t('col_facility')}</th>
                    <th className="py-3.5 px-4">{t('col_district')}</th>
                    <th className="py-3.5 px-4">{t('col_status')}</th>
                    <th className="py-3.5 px-4 text-center">{t('col_gen_beds')}</th>
                    <th className="py-3.5 px-4 text-center">{t('col_nicu_beds')}</th>
                    <th className="py-3.5 px-4 text-center">{t('col_surgeon')}</th>
                    <th className="py-3.5 px-4 text-right">{t('col_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredHospitals.map((h) => (
                    <tr 
                      key={h.id} 
                      onClick={() => {
                        setDrawerViewMode('view');
                        openDrawer(h);
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{h.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{h.village_area || t('clinical_platform')}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {h.district}, {h.state}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-black text-[10px] uppercase">
                          {t('status_online')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {h.beds_available ?? 12}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-700 dark:text-teal-400">
                        {h.nicu_beds_available ?? 3}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {h.surgeon_on_duty ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('status_active')}</span>
                        ) : (
                          <span className="text-slate-400">{t('status_standby')}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerViewMode('edit');
                            openDrawer(h);
                          }}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#006b5f] hover:text-white dark:hover:bg-teal-500 dark:hover:text-slate-950 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          {t('hosp_edit_details')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </main>

      </div>

      {/* Edit Capacity Drawer Modal */}
      {drawerOpen && selectedHospital && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-reveal text-left overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {selectedHospital.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedHospital.district}, {selectedHospital.state}
                  </p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Read-Only Details Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-2 mt-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{t('hosp_facility_details')}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block text-slate-400 font-medium">{t('hosp_type')}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedHospital.hospital_type || t('hosp_type_general')}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">{t('hosp_network')}</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{t('hosp_node')}{selectedHospital.id}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-400 font-medium">{t('hosp_contact')}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">+91 {Math.floor(Math.random() * 9000000000) + 1000000000}</span>
                  </div>
                </div>
              </div>

              {drawerViewMode === 'edit' ? (
                <form onSubmit={handleSaveCapacity} className="space-y-4 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                        {t('avail_gen_beds')}
                      </label>
                      <input
                        type="number"
                        value={drawerForm.beds_available}
                        onChange={(e) => setDrawerForm({ ...drawerForm, beds_available: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                        {t('nicu_icu_units')}
                      </label>
                      <input
                        type="number"
                        value={drawerForm.nicu_beds_available}
                        onChange={(e) => setDrawerForm({ ...drawerForm, nicu_beds_available: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                      {t("hosp_blood_bank")}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => {
                        const key = `stock_${type.toLowerCase().replace('+', '_pos').replace('-', '_neg')}`;
                        return (
                          <div key={key}>
                            <label className="block text-[10px] font-bold text-rose-500 dark:text-rose-400 mb-0.5 text-center">
                              {type}
                            </label>
                            <input
                              type="number"
                              value={drawerForm[key]}
                              onChange={(e) => setDrawerForm({ ...drawerForm, [key]: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-center text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('surgeon_on_duty')}</span>
                    <input
                      type="checkbox"
                      checked={drawerForm.surgeon_on_duty}
                      onChange={(e) => setDrawerForm({ ...drawerForm, surgeon_on_duty: e.target.checked })}
                      className="h-4 w-4 text-[#006b5f] rounded"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md cursor-pointer mt-4"
                  >
                    {saving ? t('saving') : t('confirm_capacity_update')}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                      <span className="block text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('avail_gen_beds')}</span>
                      <strong className="text-2xl text-blue-600 dark:text-blue-400 font-mono">{drawerForm.beds_available}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                      <span className="block text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{t('nicu_icu_units')}</span>
                      <strong className="text-2xl text-[#006b5f] dark:text-[#2dd4bf] font-mono">{drawerForm.nicu_beds_available}</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                      {t('hosp_blood_bank')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => {
                        const key = `stock_${type.toLowerCase().replace('+', '_pos').replace('-', '_neg')}`;
                        return (
                          <div key={key} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center flex flex-col items-center justify-center">
                            <label className="block text-[10px] font-bold text-rose-500 dark:text-rose-400 mb-0.5 text-center">
                              {type}
                            </label>
                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                              {drawerForm[key]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('surgeon_on_duty')}</span>
                    {drawerForm.surgeon_on_duty ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">{t('status_active')}</span>
                    ) : (
                      <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{t('status_standby')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HospitalDashboard;
