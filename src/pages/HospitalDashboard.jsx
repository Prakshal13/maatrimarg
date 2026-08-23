import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [drawerForm, setDrawerForm] = useState({
    beds_available: 10,
    nicu_beds_available: 3,
    surgeon_on_duty: true,
    ambulance_available: true,
    stock_o_pos: 6,
    stock_o_neg: 2,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getHospitals();
      setHospitals(res.data || []);
      setFilteredHospitals(res.data || []);
    } catch (e) {
      console.warn('Could not fetch hospitals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        stock_o_pos: Number(drawerForm.stock_o_pos),
        stock_o_neg: Number(drawerForm.stock_o_neg),
      });
      await fetchData();
      setDrawerOpen(false);
    } catch (err) {
      alert('Could not update facility: ' + (err.response?.data?.detail || err.message));
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
          badgeText="165 Active Facilities" 
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

            <button
              onClick={() => {
                if (hospitals.length > 0) openDrawer(hospitals[0]);
              }}
              className="px-4 py-2 bg-[#006b5f] hover:bg-[#005047] dark:bg-teal-500 dark:hover:bg-teal-600 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('btn_update_capacity')}</span>
            </button>
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
                  <span>+12% capacity</span>
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
                  <span>Live synced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Directory Toolbar & Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
            
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Filters
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#006b5f]"
                >
                  <option value="">All States ({uniqueStates.length})</option>
                  {uniqueStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#006b5f]"
                >
                  <option value="">All Districts ({uniqueDistricts.length})</option>
                  {uniqueDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
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
                    <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{h.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{h.village_area || 'Government Hospital Campus'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {h.district}, {h.state}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-black text-[10px] uppercase">
                          ONLINE
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
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
                        ) : (
                          <span className="text-slate-400">Standby</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openDrawer(h)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#006b5f] hover:text-white dark:hover:bg-teal-500 dark:hover:text-slate-950 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          {t('btn_edit_capacity')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-end">
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

              <form onSubmit={handleSaveCapacity} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Available General Beds
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
                    NICU / ICU Units Available
                  </label>
                  <input
                    type="number"
                    value={drawerForm.nicu_beds_available}
                    onChange={(e) => setDrawerForm({ ...drawerForm, nicu_beds_available: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      O+ Blood Stock
                    </label>
                    <input
                      type="number"
                      value={drawerForm.stock_o_pos}
                      onChange={(e) => setDrawerForm({ ...drawerForm, stock_o_pos: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                      O- Blood Reserve
                    </label>
                    <input
                      type="number"
                      value={drawerForm.stock_o_neg}
                      onChange={(e) => setDrawerForm({ ...drawerForm, stock_o_neg: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Surgeon On Duty</span>
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
                  {saving ? 'Saving...' : 'Confirm Live Capacity Update'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HospitalDashboard;
