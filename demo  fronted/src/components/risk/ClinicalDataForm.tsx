import React, { useState } from 'react';
import { ClinicalVitals } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface ClinicalDataFormProps {
  onSubmit: (vitals: ClinicalVitals) => void;
  isLoading: boolean;
  onReset: () => void;
}

export const ClinicalDataForm: React.FC<ClinicalDataFormProps> = ({ onSubmit, isLoading, onReset }) => {
  const [age, setAge] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [systolicBP, setSystolicBP] = useState<string>('');
  const [diastolicBP, setDiastolicBP] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [bodyTemp, setBodyTemp] = useState<string>('');
  const { t, language } = useThemeLanguage();

  const handleLoadSample = (type: 'normal' | 'moderate' | 'severe' = 'moderate') => {
    if (type === 'normal') {
      setAge('24');
      setHeartRate('74');
      setSystolicBP('116');
      setDiastolicBP('76');
      setBloodSugar('4.8');
      setBodyTemp('98.4');
    } else if (type === 'severe') {
      setAge('38');
      setHeartRate('115');
      setSystolicBP('165');
      setDiastolicBP('105');
      setBloodSugar('9.8');
      setBodyTemp('101.5');
    } else {
      setAge('32');
      setHeartRate('94');
      setSystolicBP('142');
      setDiastolicBP('92');
      setBloodSugar('6.4');
      setBodyTemp('99.6');
    }
  };

  const handleReset = () => {
    setAge('');
    setHeartRate('');
    setSystolicBP('');
    setDiastolicBP('');
    setBloodSugar('');
    setBodyTemp('');
    onReset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !heartRate || !systolicBP || !diastolicBP || !bloodSugar || !bodyTemp) {
      alert(
        language === 'mr'
          ? 'कृपया सर्व आवश्यक वैद्यकीय माहिती भरा.'
          : language === 'hi'
          ? 'कृपया जोखिम का अनुमान लगाने से पहले सभी क्लिनिकल माप भरें।'
          : 'Please fill in all clinical vitals before predicting risk.'
      );
      return;
    }

    onSubmit({
      age: parseFloat(age),
      heartRate: parseFloat(heartRate),
      systolicBP: parseFloat(systolicBP),
      diastolicBP: parseFloat(diastolicBP),
      bloodSugar: parseFloat(bloodSugar),
      bodyTemp: parseFloat(bodyTemp)
    });
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-xl p-6 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 pb-4 border-b border-surface-border dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-primary dark:text-slate-100">
            {t('clinicalDataEntry')}
          </h3>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
            {t('clinicalDataSub')}
          </p>
        </div>

        {/* Quick Test Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleLoadSample('normal')}
            className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-[11px] font-bold transition-colors"
            title="Load Normal/Routine Baseline Vitals"
          >
            🟢 {language === 'mr' ? 'सामान्य' : 'Normal'}
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('moderate')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-colors"
            title="Load Moderate Risk Vitals"
          >
            🟡 {language === 'mr' ? 'मध्यम' : 'Moderate'}
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('severe')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors"
            title="Load High-Risk Pre-eclampsia Vitals"
          >
            🔴 {language === 'mr' ? 'अति-जोखीम' : 'Severe'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block">
              {t('age')} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="10"
                max="65"
                step="1"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-100 outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 font-mono"
              />
              <span className="absolute right-3 top-2 text-[10px] font-mono text-on-surface-variant dark:text-slate-400">
                {language === 'mr' ? 'वर्षे' : language === 'hi' ? 'वर्ष' : 'Years'}
              </span>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block">
              {t('heartRate')} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="40"
                max="220"
                step="1"
                required
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="e.g. 85"
                className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-100 outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 font-mono"
              />
              <span className="absolute right-3 top-2 text-[10px] font-mono text-on-surface-variant dark:text-slate-400">
                bpm
              </span>
            </div>
          </div>

          {/* Systolic BP */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block">
              {t('systolicBP')} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="60"
                max="260"
                step="1"
                required
                value={systolicBP}
                onChange={(e) => setSystolicBP(e.target.value)}
                placeholder="e.g. 120"
                className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-100 outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 font-mono"
              />
              <span className="absolute right-3 top-2 text-[10px] font-mono text-on-surface-variant dark:text-slate-400">
                mmHg
              </span>
            </div>
          </div>

          {/* Diastolic BP */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block">
              {t('diastolicBP')} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="35"
                max="160"
                step="1"
                required
                value={diastolicBP}
                onChange={(e) => setDiastolicBP(e.target.value)}
                placeholder="e.g. 80"
                className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-100 outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 font-mono"
              />
              <span className="absolute right-3 top-2 text-[10px] font-mono text-on-surface-variant dark:text-slate-400">
                mmHg
              </span>
            </div>
          </div>

          {/* Blood Sugar (BS) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block">
              {t('bloodSugar')} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1.0"
                max="35.0"
                step="0.1"
                required
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                placeholder="e.g. 5.5"
                className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-100 outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 font-mono"
              />
              <span className="absolute right-3 top-2 text-[10px] font-mono text-on-surface-variant dark:text-slate-400">
                mmol/L
              </span>
            </div>
          </div>

          {/* Body Temperature */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block">
              {t('bodyTemp')} *
            </label>
            <div className="relative">
              <input
                type="number"
                min="90.0"
                max="109.0"
                step="0.1"
                required
                value={bodyTemp}
                onChange={(e) => setBodyTemp(e.target.value)}
                placeholder="e.g. 98.6"
                className="w-full bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-100 outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 font-mono"
              />
              <span className="absolute right-3 top-2 text-[10px] font-mono text-on-surface-variant dark:text-slate-400">
                °F
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-surface-border dark:border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="text-xs text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 font-semibold"
          >
            {t('resetForm')}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-primary dark:bg-teal-500 hover:bg-primary/90 text-white dark:text-slate-950 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>{t('evaluating')}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>{t('predictRisk')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
