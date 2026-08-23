import React from 'react';
import { MOCK_MISSIONS } from '../../services/mockData';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export const ActiveMissions: React.FC = () => {
  const { t, language } = useThemeLanguage();

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-xl flex flex-col shadow-sm h-64 shrink-0 relative overflow-hidden transition-colors">
      <div className="p-3.5 border-b border-surface-border dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-body-md font-bold text-primary dark:text-slate-100 flex items-center gap-2 text-xs">
          <span className="material-symbols-outlined text-teal-accent text-[18px]">emergency</span>
          {t('activeMissions')}
          <span className="bg-surface-container-high dark:bg-slate-800 text-primary dark:text-teal-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {language === 'mr' ? 'थेट (३)' : language === 'hi' ? 'लाइव (3)' : 'LIVE (3)'}
          </span>
        </h3>
        <span className="text-[10px] text-on-surface-variant dark:text-slate-400 font-mono">
          {language === 'mr' ? 'सॅटेलाइट सक्रिय' : language === 'hi' ? 'सैटेलाइट सक्रिय' : 'SAT-LINK ACTIVE'}
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {MOCK_MISSIONS.map((mission) => {
          const isCritical = mission.status === 'CRITICAL';
          return (
            <div
              key={mission.id}
              className={`p-2.5 rounded-lg border relative overflow-hidden transition-all text-xs ${
                isCritical
                  ? 'border-error/30 bg-error/5 dark:bg-error/10 hover:bg-error/10'
                  : 'border-surface-border dark:border-slate-700 bg-surface-container-low dark:bg-slate-800/60 hover:bg-surface-container'
              }`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isCritical ? 'bg-error' : 'bg-secondary dark:bg-teal-400'
                }`}
              />
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`font-bold tracking-wider text-[10px] ${
                    isCritical ? 'text-error' : 'text-secondary dark:text-teal-400'
                  }`}
                >
                  {isCritical
                    ? language === 'mr'
                      ? 'अति तातडीचे'
                      : language === 'hi'
                      ? 'अति गंभीर'
                      : 'CRITICAL'
                    : language === 'mr'
                    ? 'सक्रिय'
                    : language === 'hi'
                    ? 'सक्रिय'
                    : 'ACTIVE'}{' '}
                  • {mission.unit}
                </span>
                <span className="font-mono font-bold text-on-surface-variant dark:text-slate-300">
                  ETA: {mission.eta}
                </span>
              </div>
              <div className="font-semibold text-primary dark:text-slate-200 truncate">
                {language === 'mr' ? 'गंतव्य:' : language === 'hi' ? 'गंतव्य:' : 'To:'} {mission.destination}
              </div>
              <div className="text-[11px] text-on-surface-variant dark:text-slate-400 flex items-center justify-between mt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">ambulance</span>
                  {mission.origin}
                </span>
                {mission.driver && (
                  <span className="text-[10px]">
                    {language === 'mr' ? 'चालक:' : language === 'hi' ? 'चालक:' : 'Drv:'} {mission.driver}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
