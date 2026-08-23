import React, { useState } from 'react';
import { TopNavBar } from '../components/common/TopNavBar';
import { SideNavBar } from '../components/common/SideNavBar';
import { ClinicalDataForm } from '../components/risk/ClinicalDataForm';
import { RiskResultPanel } from '../components/risk/RiskResultPanel';
import { HospitalService } from '../services/api';
import { ClinicalVitals, RiskPredictionResponse } from '../types';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export const RiskAssessmentPage: React.FC = () => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultState, setResultState] = useState<'empty' | 'loading' | 'result' | 'error'>('empty');
  const [resultData, setResultData] = useState<RiskPredictionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('Unable to calculate risk. Please try again.');
  const [lastVitals, setLastVitals] = useState<ClinicalVitals | null>(null);
  const { t, language } = useThemeLanguage();

  const handlePredictRisk = async (vitals: ClinicalVitals) => {
    setLastVitals(vitals);
    setIsLoading(true);
    setResultState('loading');
    setResultData(null);

    try {
      const response = await HospitalService.predictRisk(vitals);
      setResultData(response);
      setResultState('result');
    } catch (err: any) {
      console.error('Risk prediction failed:', err);
      setErrorMessage(err.message || (language === 'mr' ? 'जोखीम मूल्यमापनात त्रुटी आली. पुन्हा प्रयत्न करा.' : 'Unable to calculate risk. Please try again.'));
      setResultState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastVitals) {
      handlePredictRisk(lastVitals);
    }
  };

  const handleReset = () => {
    setResultState('empty');
    setResultData(null);
    setLastVitals(null);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-primary dark:text-slate-100 tracking-tight">
                {t('maternalRiskAssessment')}
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                {t('maternalRiskSub')}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-full text-xs font-semibold text-secondary dark:text-teal-400 shadow-xs">
              <span className="material-symbols-outlined text-[14px]">psychiatry</span>
              {t('icmrEngineActive')}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <ClinicalDataForm
                onSubmit={handlePredictRisk}
                isLoading={isLoading}
                onReset={handleReset}
              />
            </div>

            <div className="lg:col-span-5">
              <RiskResultPanel
                state={resultState}
                result={resultData}
                errorMessage={errorMessage}
                onRetry={handleRetry}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
