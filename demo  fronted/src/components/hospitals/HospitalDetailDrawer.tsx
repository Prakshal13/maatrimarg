import React, { useState, useEffect } from 'react';
import { Hospital } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface HospitalDetailDrawerProps {
  hospital: Hospital | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveUpdate: (id: string, updateData: Partial<Hospital>) => Promise<void>;
}

export const HospitalDetailDrawer: React.FC<HospitalDetailDrawerProps> = ({
  hospital,
  isOpen,
  onClose,
  onSaveUpdate
}) => {
  const [icuBeds, setIcuBeds] = useState<number>(0);
  const [status, setStatus] = useState<string>('Operational');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const { t, language } = useThemeLanguage();

  useEffect(() => {
    if (hospital) {
      setIcuBeds(hospital.availableIcuBeds || 0);
      setStatus(hospital.status || 'Operational');
      setFeedbackMsg(null);
    }
  }, [hospital]);

  if (!isOpen || !hospital) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      await onSaveUpdate(hospital.id, {
        availableIcuBeds: Number(icuBeds),
        status: status as any
      });
      setFeedbackMsg(
        language === 'mr'
          ? 'रुग्णालयाची माहिती यशस्वीरित्या अपडेट झाली!'
          : language === 'hi'
          ? 'अस्पताल क्षमता मेट्रिक्स सफलतापूर्वक अपडेट किए गए!'
          : 'Facility capacity metrics updated successfully!'
      );
      setTimeout(() => {
        setFeedbackMsg(null);
      }, 2500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg(
        language === 'mr'
          ? 'अपडेट अयशस्वी.'
          : language === 'hi'
          ? 'अपडेट विफल रहा।'
          : 'Failed to update hospital metrics.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isDivert = status === 'DIVERT' || status === 'Critical Load';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface-container-lowest dark:bg-slate-900 h-full shadow-2xl border-l border-surface-border dark:border-slate-800 flex flex-col z-10 animate-reveal">
        {/* Header */}
        <div className="p-6 border-b border-surface-border dark:border-slate-800 flex justify-between items-start bg-surface-container-lowest dark:bg-slate-900">
          <div>
            <span className="text-[10px] font-mono font-semibold text-secondary dark:text-teal-400 uppercase tracking-widest block mb-1">
              {t('facilityDossier')} • {hospital.id}
            </span>
            <h3 className="text-lg font-bold text-primary dark:text-slate-100 leading-tight">
              {hospital.name}
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">
              {hospital.district}, {hospital.state}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant dark:text-slate-400 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Last Updated */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isDivert ? 'bg-error animate-ping' : 'bg-status-success'
                }`}
              />
              <span className="text-xs font-bold text-primary dark:text-slate-200">
                {status}
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant dark:text-slate-400">
              {language === 'mr' ? 'अपडेट:' : language === 'hi' ? 'अंतिम अपडेट:' : 'Updated:'}{' '}
              {new Date(hospital.updatedAt || Date.now()).toLocaleTimeString()}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 border border-surface-border dark:border-slate-700 rounded-xl bg-surface-container-lowest dark:bg-slate-800/60">
              <span className="text-[11px] font-medium text-on-surface-variant dark:text-slate-400 block mb-1">
                {t('availableIcuInput')}
              </span>
              <span className="text-xl font-bold font-mono text-primary dark:text-teal-400">
                {hospital.availableIcuBeds} / {hospital.totalIcuBeds}
              </span>
            </div>

            <div className="p-3.5 border border-surface-border dark:border-slate-700 rounded-xl bg-surface-container-lowest dark:bg-slate-800/60">
              <span className="text-[11px] font-medium text-on-surface-variant dark:text-slate-400 block mb-1">
                {t('availableBeds')}
              </span>
              <span className="text-xl font-bold font-mono text-primary dark:text-teal-400">
                {hospital.available_beds} / {hospital.total_beds}
              </span>
            </div>

            <div className="p-3.5 border border-surface-border dark:border-slate-700 rounded-xl bg-surface-container-lowest dark:bg-slate-800/60">
              <span className="text-[11px] font-medium text-on-surface-variant dark:text-slate-400 block mb-1">
                {t('ventilatorsStandby')}
              </span>
              <span className="text-xl font-bold font-mono text-primary dark:text-teal-400">
                {hospital.availableVentilators} / {hospital.totalVentilators}
              </span>
            </div>

            <div className="p-3.5 border border-surface-border dark:border-slate-700 rounded-xl bg-surface-container-lowest dark:bg-slate-800/60">
              <span className="text-[11px] font-medium text-on-surface-variant dark:text-slate-400 block mb-1">
                {t('bloodReserves')}
              </span>
              <span className="text-xl font-bold font-mono text-primary dark:text-teal-400">
                {hospital.bloodUnitsO_neg || 14} Units
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-800/70 border border-surface-border dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-on-surface dark:text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-teal-accent mt-0.5">location_on</span>
              <span>{hospital.address || `${hospital.name}, ${hospital.district}, Maharashtra`}</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface dark:text-slate-300">
              <span className="material-symbols-outlined text-[16px] text-teal-accent">call</span>
              <span>{hospital.contactPhone || '+91 22 2410 7000 (Obstetrics Emergency)'}</span>
            </div>
          </div>

          {/* Quick Update Form */}
          <div className="pt-4 border-t border-surface-border dark:border-slate-800">
            <h4 className="text-sm font-bold text-primary dark:text-slate-100 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[18px]">edit_note</span>
              {t('emergencyCapacityUpdate')}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant dark:text-slate-400 mb-1">
                  {t('availableIcuInput')}
                </label>
                <input
                  type="number"
                  min="0"
                  max={hospital.totalIcuBeds}
                  value={icuBeds}
                  onChange={(e) => setIcuBeds(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-container-lowest dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg text-sm text-on-surface dark:text-white font-mono focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant dark:text-slate-400 mb-1">
                  {t('operationalStatusInput')}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg text-sm text-on-surface dark:text-white focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 outline-none"
                >
                  <option value="Operational">Operational (सक्रिय / कार्यरत)</option>
                  <option value="Critical Load">Critical Load (गंभीर भार)</option>
                  <option value="DIVERT">DIVERT (डायव्हर्ट / पूर्ण)</option>
                  <option value="Offline">Offline (बंद)</option>
                </select>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold text-center ${
                    feedbackMsg.includes('यशस्वी') || feedbackMsg.includes('सफलतापूर्वक') || feedbackMsg.includes('success')
                      ? 'bg-status-success/15 text-status-success border border-status-success/30'
                      : 'bg-error/15 text-error border border-error/30'
                  }`}
                >
                  {feedbackMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    {t('savingChanges')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {t('saveFacilityUpdate')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border dark:border-slate-800 bg-surface-container-low dark:bg-slate-800/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-surface-border dark:border-slate-700 rounded-lg text-xs font-semibold text-on-surface dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
