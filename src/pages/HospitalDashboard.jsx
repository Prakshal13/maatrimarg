import React, { useState, useEffect } from 'react';
import { api } from '../api/endpoints';
import { useLanguage } from '../context/LanguageContext';
import { 
  Hospital, 
  Activity, 
  Droplet, 
  Edit3, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  PhoneCall,
  UserCheck,
  Send,
  Navigation
} from 'lucide-react';

const HospitalDashboard = () => {
  const { t } = useLanguage();
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [activeReferrals, setActiveReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Capacity Modal State
  const [editingHospital, setEditingHospital] = useState(null);
  const [capacityForm, setCapacityForm] = useState({
    beds_available: 10,
    nicu_beds_available: 3,
    surgeon_on_duty: true,
    ambulance_available: true,
    stock_o_pos: 6,
    stock_o_neg: 2,
    stock_a_pos: 4,
    stock_a_neg: 1,
    stock_b_pos: 5,
    stock_b_neg: 1,
    stock_ab_pos: 2,
    stock_ab_neg: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hospRes, refRes] = await Promise.all([
        api.getHospitals(),
        api.getActiveReferrals(),
      ]);
      setHospitals(hospRes.data || []);
      setFilteredHospitals(hospRes.data || []);
      setActiveReferrals(refRes.data || []);
    } catch (e) {
      console.warn('Error fetching hospital data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Hospitals by search & state
  useEffect(() => {
    let list = hospitals;
    if (selectedState !== 'all') {
      list = list.filter(h => h.state === selectedState);
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
  }, [searchQuery, selectedState, hospitals]);

  const openEditModal = (h) => {
    setEditingHospital(h);
    setCapacityForm({
      beds_available: h.beds_available ?? 10,
      nicu_beds_available: h.nicu_beds_available ?? 3,
      surgeon_on_duty: Boolean(h.surgeon_on_duty),
      ambulance_available: Boolean(h.ambulance_available),
      stock_o_pos: h.stock_o_pos ?? 6,
      stock_o_neg: h.stock_o_neg ?? 2,
      stock_a_pos: h.stock_a_pos ?? 4,
      stock_a_neg: h.stock_a_neg ?? 1,
      stock_b_pos: h.stock_b_pos ?? 5,
      stock_b_neg: h.stock_b_neg ?? 1,
      stock_ab_pos: h.stock_ab_pos ?? 2,
      stock_ab_neg: h.stock_ab_neg ?? 0,
    });
  };

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    if (!editingHospital) return;
    try {
      await api.updateHospitalCapacity(editingHospital.id, capacityForm);
      await fetchData();
      setEditingHospital(null);
      alert(`Updated capacity for ${editingHospital.name}`);
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Referral Actions: Acknowledge
  const handleAcknowledge = async (refId) => {
    try {
      await api.acknowledgeReferral(refId);
      await fetchData();
    } catch (err) {
      alert('Acknowledge failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Referral Actions: Update Status
  const handleStatusChange = async (refId, newStatus) => {
    try {
      await api.updateReferralStatus(refId, {
        status: newStatus,
        ambulance_id: 'MH-34-108',
      });
      await fetchData();
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Referral Actions: Escalate to Higher Facility
  const handleEscalate = async (refId) => {
    if (!confirm('Are you sure you want to escalate this referral to the next eligible tertiary facility?')) return;
    try {
      await api.escalateReferral(refId, { reason: 'Capacity exhausted / tertiary intervention required' });
      await fetchData();
      alert('Referral escalated successfully to the next available higher hospital.');
    } catch (err) {
      alert('Escalation failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold">
            <Hospital className="w-3.5 h-3.5" />
            <span>Facility CMO & Bed Inventory Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
            {t('hospitals')} & Live Emergency Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time telemetry across {hospitals.length}+ government facilities in Maharashtra & Tamil Nadu with live bed updates, blood bank unit synchronization, and 1-click referral acknowledgment.
          </p>
        </div>
      </div>

      {/* Active Referrals Alert Queue */}
      {activeReferrals.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <span>Incoming Emergency Referrals ({activeReferrals.length} Active Dispatches)</span>
            </div>
            <span className="text-xs font-bold text-slate-500">Live Auto-Escalation Monitoring Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeReferrals.map((ref) => (
              <div key={ref.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{ref.mother?.name || 'Mother'}</h4>
                    <p className="text-xs text-slate-500">
                      Age: {ref.mother?.age}y • Village: {ref.mother?.village} • Blood: <strong className="text-rose-600">{ref.mother?.blood_type}</strong>
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    ref.tier === 'dispatch' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {ref.tier} • {ref.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                  <span>Target: <strong>{ref.hospital?.name}</strong></span>
                  <span>ETA: ~<strong>{ref.eta_minutes || 18} min</strong></span>
                </div>

                {/* Referral Action Controls */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {!ref.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(ref.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Acknowledge Referral</span>
                    </button>
                  ) : (
                    <>
                      {ref.status !== 'en_route' && (
                        <button
                          onClick={() => handleStatusChange(ref.id, 'en_route')}
                          className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                        >
                          Dispatch Ambulance
                        </button>
                      )}
                      {ref.status === 'en_route' && (
                        <button
                          onClick={() => handleStatusChange(ref.id, 'arrived')}
                          className="py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                        >
                          Mark Arrived
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => handleEscalate(ref.id)}
                    className="py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Escalate
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name or district..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['all', 'Maharashtra', 'Tamil Nadu'].map((state) => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedState === state
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {state === 'all' ? 'All States' : state}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.slice(0, 30).map((h) => (
          <div key={h.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-left">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {h.state} • {h.district}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1.5">{h.name}</h3>
                <p className="text-xs text-slate-400">{h.village_area || h.district}</p>
              </div>

              <button
                onClick={() => openEditModal(h)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 border border-slate-200 transition-colors"
                title="Edit Live Capacity"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400">Available Beds</div>
                <div className="text-base font-black text-slate-800">{h.beds_available ?? 0}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400">NICU Beds</div>
                <div className="text-base font-black text-blue-600">{h.nicu_beds_available ?? 0}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400">Surgeon</div>
                <div className={`text-base font-black ${h.surgeon_on_duty ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {h.surgeon_on_duty ? 'YES' : 'NO'}
                </div>
              </div>
            </div>

            {/* Blood Stock Chips */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-rose-500" />
                <span>Live Blood Stock Units:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-700">O-: {h.stock_o_neg ?? 0}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">O+: {h.stock_o_pos ?? 0}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">A+: {h.stock_a_pos ?? 0}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">B+: {h.stock_b_pos ?? 0}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">AB+: {h.stock_ab_pos ?? 0}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Edit Capacity Modal */}
      {editingHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Update Facility Capacity</h3>
                <p className="text-xs text-slate-500">{editingHospital.name}</p>
              </div>
              <button onClick={() => setEditingHospital(null)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <form onSubmit={handleUpdateCapacity} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Available General Beds</label>
                  <input
                    type="number"
                    value={capacityForm.beds_available}
                    onChange={(e) => setCapacityForm({ ...capacityForm, beds_available: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Available NICU Beds</label>
                  <input
                    type="number"
                    value={capacityForm.nicu_beds_available}
                    onChange={(e) => setCapacityForm({ ...capacityForm, nicu_beds_available: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capacityForm.surgeon_on_duty}
                    onChange={(e) => setCapacityForm({ ...capacityForm, surgeon_on_duty: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Surgeon on Duty</span>
                </label>

                <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capacityForm.ambulance_available}
                    onChange={(e) => setCapacityForm({ ...capacityForm, ambulance_available: e.target.checked })}
                    className="rounded text-teal-600"
                  />
                  <span>Ambulance Ready</span>
                </label>
              </div>

              {/* Blood Stocks */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="font-bold text-slate-700">Blood Bank Unit Counts:</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {['o_pos', 'o_neg', 'a_pos', 'a_neg', 'b_pos', 'b_neg', 'ab_pos', 'ab_neg'].map((bt) => (
                    <div key={bt}>
                      <label className="block text-[10px] uppercase font-bold text-slate-500">{bt.replace('_', ' ')}</label>
                      <input
                        type="number"
                        min="0"
                        value={capacityForm[`stock_${bt}`]}
                        onChange={(e) => setCapacityForm({ ...capacityForm, [`stock_${bt}`]: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-colors mt-2"
              >
                Save & Broadcast Live Telemetry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HospitalDashboard;
