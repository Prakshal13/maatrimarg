import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskPredictionResponse } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface RiskResultPanelProps {
  state: 'empty' | 'loading' | 'result' | 'error';
  result: RiskPredictionResponse | null;
  errorMessage?: string;
  onRetry: () => void;
}

export const RiskResultPanel: React.FC<RiskResultPanelProps> = ({
  state,
  result,
  errorMessage = 'Unable to calculate risk. Please try again.',
  onRetry
}) => {
  const navigate = useNavigate();
  const { t, language } = useThemeLanguage();

  const getTierLabel = (tier: string) => {
    if (tier === 'Dispatch') {
      return language === 'mr' ? 'आपत्कालीन रेफरल (Dispatch)' : language === 'hi' ? 'आपातकालीन रेफरल (Dispatch)' : 'Emergency Dispatch';
    }
    if (tier === 'Prep') {
      return language === 'mr' ? 'दक्षता व निरीक्षण (Prep)' : language === 'hi' ? 'निगरानी एवं तैयारी (Prep)' : 'Clinical Observation (Prep)';
    }
    return language === 'mr' ? 'स्थिर / नियमित तपासणी (Routine)' : language === 'hi' ? 'स्थिर / नियमित देखभाल (Routine)' : 'Routine Antenatal Care';
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-center min-h-[440px] transition-colors">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border dark:border-slate-800">
        <h3 className="text-sm font-bold text-primary dark:text-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[18px]">
            analytics
          </span>
          {t('assessmentResult')}
        </h3>
        {result && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-slate-800 text-on-surface-variant dark:text-slate-300">
            ML SCORE: {result.score}/100
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {state === 'empty' && (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low dark:bg-slate-800 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px] text-on-surface-variant dark:text-slate-400">
                assignment
              </span>
            </div>
            <h4 className="text-sm font-bold text-primary dark:text-slate-200">
              {t('noAssessmentYet')}
            </h4>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
              {t('enterVitalsPrompt')}
            </p>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 border-4 border-secondary dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-primary dark:text-slate-100">
              {language === 'mr'
                ? 'क्लिनिकल एआय मॉडेल विश्लेषण करत आहे...'
                : language === 'hi'
                ? 'क्लिनिकल एआई मॉडल द्वारा मूल्यांकन जारी है...'
                : 'Processing Clinical Machine Learning Model...'}
            </p>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">
              {language === 'mr'
                ? 'जोखीम निर्देशांक आणि जीवनविषयक निर्देशकांची पडताळणी केली जात आहे'
                : language === 'hi'
                ? 'जोखिम सूचकांक और जीवन-संकेतक मैट्रिक्स का सत्यापन हो रहा है'
                : 'Cross-referencing gestational indicators & vital risk matrix'}
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 bg-error-container/20 text-error rounded-2xl flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <p className="text-sm font-bold text-error mb-2">{errorMessage}</p>
            <button
              onClick={onRetry}
              className="px-4 py-2 border border-surface-border dark:border-slate-700 rounded-lg text-xs font-semibold text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              {language === 'mr' ? 'पुन्हा तपासा' : language === 'hi' ? 'पुनः मूल्यांकन करें' : 'Retry Evaluation'}
            </button>
          </div>
        )}

        {state === 'result' && result && (
          <div className="flex flex-col items-center text-center space-y-4 animate-reveal">
            {/* Risk Badge Icon */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                result.tier === 'Dispatch'
                  ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
                  : result.tier === 'Prep'
                  ? 'bg-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'bg-teal-500/20 text-teal-600 dark:text-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.2)]'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {result.tier === 'Dispatch' ? 'warning' : result.tier === 'Prep' ? 'report' : 'check_circle'}
              </span>
            </div>

            <div>
              <h4
                className={`text-xl font-bold mb-1 ${
                  result.tier === 'Dispatch'
                    ? 'text-rose-500'
                    : result.tier === 'Prep'
                    ? 'text-amber-500'
                    : 'text-teal-600 dark:text-teal-400'
                }`}
              >
                {getTierLabel(result.tier)}
              </h4>
              <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed max-w-sm">
                {result.explanation}
              </p>
            </div>

            {/* Continuous Gauge Bar */}
            <div className="w-full bg-surface-container-low dark:bg-slate-800 p-3 rounded-xl border border-surface-border dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-on-surface-variant dark:text-slate-400 font-bold uppercase text-[10px]">
                  {t('riskIndex')}
                </span>
                <span className="font-bold text-sm text-primary dark:text-slate-100">
                  {result.score} <span className="text-[10px] text-slate-400">/ 100</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.score >= 65
                      ? 'bg-rose-500'
                      : result.score >= 35
                      ? 'bg-amber-400'
                      : 'bg-teal-400'
                  }`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>0 (Routine)</span>
                <span>35 (Prep)</span>
                <span>65+ (Critical)</span>
              </div>
            </div>

            {/* Identified Biomarker Factors */}
            {result.factors && result.factors.length > 0 && (
              <div className="w-full text-left bg-surface-container-low dark:bg-slate-800/80 p-3 rounded-xl border border-surface-border dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-500">troubleshoot</span>
                  {language === 'mr' ? 'तपासलेले जोखीम घटक:' : language === 'hi' ? 'पहचाने गए जोखिम कारक:' : 'Identified Risk Drivers:'}
                </span>
                <ul className="space-y-1">
                  {result.factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-on-surface dark:text-slate-300 text-[11px]">
                      <span className="text-secondary dark:text-teal-400 font-bold">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Protocol Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="w-full text-left bg-surface-container-low dark:bg-slate-800/80 p-3 rounded-xl border border-surface-border dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant dark:text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-teal-500">medical_services</span>
                  {t('protocolRecommendations')}
                </span>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-on-surface dark:text-slate-300 text-[11px]">
                      <span className="text-teal-500 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* If High Risk, direct button to dispatch in Command Center */}
            {result.tier === 'Dispatch' && (
              <button
                onClick={() => navigate('/command-center')}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">ambulance</span>
                <span>
                  {language === 'mr'
                    ? 'कमांड सेंटरवर तात्काळ रुग्णवाहिका मार्ग शोधा'
                    : language === 'hi'
                    ? 'कमांड सेंटर पर तत्काल एम्बुलेंस मार्ग देखें'
                    : 'Dispatch & Find Optimal Hospital Route'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
