import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import UserProfileDropdown from '../components/UserProfileDropdown';
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
  const { t } = useLanguage();
  const { logout } = useAuth();
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

  const handleSaveDrawer = async (e) => {
    e.preventDefault();
    if (!selectedHospital) return;
    setSaving(true);
    try {
      await api.updateHospitalCapacity(selectedHospital.id, drawerForm);
      await fetchData();
      setDrawerOpen(false);
      alert(`Capacity updated for ${selectedHospital.name}`);
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const totalBeds = hospitals.reduce((acc, h) => acc + (h.beds_available || 0), 0);
  const totalNicu = hospitals.reduce((acc, h) => acc + (h.nicu_beds_available || 0), 0);
  const totalONeg = hospitals.reduce((acc, h) => acc + (h.stock_o_neg || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#f6fafe] text-[#171c1f] font-sans antialiased">
      
      {/* Sidebar matching Stitch Screen 6 */}
      <aside className="w-[260px] bg-white border-r border-slate-200 shadow-xs hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#006b5f] flex items-center justify-center text-white font-black text-base shadow-sm">
              <span className="material-symbols-outlined text-[18px]">local_hospital</span>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight font-['Plus_Jakarta_Sans']">
                MaatriMarg
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Command Center
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-xs font-bold text-left">
          <Link
            to="/command-center"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">hub</span>
            <span>Network Command</span>
          </Link>

          <button
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#006b5f]/10 text-[#006b5f] font-extrabold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">domain</span>
            <span>Hospitals Directory</span>
          </button>

          <Link
            to="/asha/maternal"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
            <span>Risk Assessment</span>
          </Link>

          <div className="pt-6 pb-2 px-3">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">
              System Modules
            </span>
          </div>

          <Link
            to="/asha/child"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">child_care</span>
            <span>Pediatric VIPER</span>
          </Link>

          <Link
            to="/asha/chronic"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
            <span>Cardiovascular Risk</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all mb-1"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Back to Home</span>
          </Link>
          <button
            onClick={() => { logout(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facilities or districts..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#006b5f]"
            />
          </div>

          <div className="flex items-center gap-2">
            <UserProfileDropdown />
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto text-left">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                Hospitals Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage and monitor health infrastructure across Maharashtra & Tamil Nadu districts.
              </p>
            </div>

            <button
              onClick={() => {
                if (hospitals.length > 0) openDrawer(hospitals[0]);
              }}
              className="px-4 py-2 bg-[#006b5f] hover:bg-[#005047] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Facility Capacity</span>
            </button>
          </div>

          {/* 3 Summary Cards (Stitch Screen 6 Tokens) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Total Facilities</span>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                  {hospitals.length}
                </span>
                <span className="material-symbols-outlined text-[#006b5f] text-[28px]">
                  domain
                </span>
              </div>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">ICU & NICU Beds Available</span>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-black text-teal-700 font-['Plus_Jakarta_Sans']">
                  {totalNicu}
                </span>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% capacity</span>
                </div>
              </div>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500">Blood Units (O- Negative Reserve)</span>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-black text-rose-600 font-['Plus_Jakarta_Sans']">
                  {totalONeg}
                </span>
                <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  <span>Live synced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Directory Toolbar & Table (Stitch Screen 6) */}
          <div className="border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search facilities or districts..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-[#006b5f]"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedState}
                  onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Facility Name</th>
                    <th className="p-4">District & State</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Gen Beds</th>
                    <th className="p-4 text-center">NICU Beds</th>
                    <th className="p-4 text-center">Surgeon</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredHospitals.slice(0, 30).map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{h.name}</td>
                      <td className="p-4 text-slate-500">{h.district}, {h.state}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-[#006b5f] border border-teal-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006b5f]"></span>
                          Operational
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-900">{h.beds_available}</td>
                      <td className="p-4 text-center font-bold text-teal-700">{h.nicu_beds_available}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.surgeon_on_duty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {h.surgeon_on_duty ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openDrawer(h)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-[#006b5f] hover:text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Edit Live Capacity
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

      {/* Slide-over Detail Drawer (Exact Stitch Screen 6) */}
      {drawerOpen && selectedHospital && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDrawerOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 text-left">
            
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  {selectedHospital.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedHospital.district}, {selectedHospital.state}</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrawer} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-teal-50 text-[#006b5f] border border-teal-200">
                  <span className="w-2 h-2 rounded-full bg-[#006b5f]"></span>
                  <span>Operational</span>
                </span>
                <span className="text-xs text-slate-400">Last updated: Just now</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Available General Beds</div>
                  <input
                    type="number"
                    value={drawerForm.beds_available}
                    onChange={(e) => setDrawerForm({ ...drawerForm, beds_available: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-base font-black text-slate-900"
                  />
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Available NICU Beds</div>
                  <input
                    type="number"
                    value={drawerForm.nicu_beds_available}
                    onChange={(e) => setDrawerForm({ ...drawerForm, nicu_beds_available: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-base font-black text-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={drawerForm.surgeon_on_duty}
                    onChange={(e) => setDrawerForm({ ...drawerForm, surgeon_on_duty: e.target.checked })}
                    className="rounded text-[#006b5f]"
                  />
                  <span className="text-xs font-bold text-slate-700">Surgeon on Duty</span>
                </label>

                <label className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={drawerForm.ambulance_available}
                    onChange={(e) => setDrawerForm({ ...drawerForm, ambulance_available: e.target.checked })}
                    className="rounded text-[#006b5f]"
                  />
                  <span className="text-xs font-bold text-slate-700">Ambulance Ready</span>
                </label>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase text-slate-700">Blood Bank Reserves</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">O+ Units</label>
                    <input
                      type="number"
                      value={drawerForm.stock_o_pos}
                      onChange={(e) => setDrawerForm({ ...drawerForm, stock_o_pos: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">O- Units (Universal)</label>
                    <input
                      type="number"
                      value={drawerForm.stock_o_neg}
                      onChange={(e) => setDrawerForm({ ...drawerForm, stock_o_neg: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#006b5f] hover:bg-[#005047] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Live Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default HospitalDashboard;
