import React from 'react';
import { Hospital } from '../../types';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface CapacityTableProps {
  hospitals: Hospital[];
  onSelectHospital?: (hospital: Hospital) => void;
}

export const CapacityTable: React.FC<CapacityTableProps> = ({ hospitals, onSelectHospital }) => {
  const { t } = useThemeLanguage();

  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-xl shadow-sm overflow-hidden w-full transition-colors">
      <div className="p-4 border-b border-surface-border dark:border-slate-800 flex justify-between items-center bg-surface-container-lowest dark:bg-slate-900">
        <div>
          <h3 className="text-body-lg font-bold text-primary dark:text-slate-100 text-sm">
            {t('criticalCapacityOverview')}
          </h3>
          <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
            {t('criticalCapacitySub')}
          </p>
        </div>
        <span className="text-label-caps text-[10px] font-bold px-2 py-1 rounded bg-surface-container-low dark:bg-slate-800 text-on-surface-variant dark:text-slate-300">
          {t('autoSyncing')}
        </span>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[550px] text-xs">
          <thead>
            <tr className="bg-surface-container-low dark:bg-slate-800/80 border-b border-surface-border dark:border-slate-800 text-on-surface-variant dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="p-3">{t('facilityName')}</th>
              <th className="p-3">{t('district')}</th>
              <th className="p-3 text-right">{t('availableBeds')}</th>
              <th className="p-3 text-right">{t('icuUnits')}</th>
              <th className="p-3 text-center">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border dark:divide-slate-800 text-on-surface dark:text-slate-200">
            {hospitals.slice(0, 6).map((hosp) => {
              const isZero = hosp.available_beds === 0;
              const isLow = hosp.available_beds > 0 && hosp.available_beds < 5;

              return (
                <tr
                  key={hosp.id}
                  onClick={() => onSelectHospital?.(hosp)}
                  className="hover:bg-surface-container-low dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <td className="p-3 font-semibold text-primary dark:text-slate-100">
                    {hosp.name}
                  </td>
                  <td className="p-3 text-on-surface-variant dark:text-slate-400">
                    {hosp.district}
                  </td>
                  <td className={`p-3 text-right font-mono font-semibold ${isZero ? 'text-error font-bold' : isLow ? 'text-amber-500' : 'text-teal-600 dark:text-teal-400'}`}>
                    {hosp.available_beds} / {hosp.total_beds}
                  </td>
                  <td className="p-3 text-right font-mono text-on-surface-variant dark:text-slate-400">
                    {hosp.availableIcuBeds} / {hosp.totalIcuBeds}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isZero
                          ? 'bg-error/15 text-error border border-error/30 animate-pulse'
                          : isLow
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-teal-500/15 text-secondary dark:text-teal-400 border border-teal-500/30'
                      }`}
                    >
                      {isZero
                        ? t('divert')
                        : isLow
                        ? t('criticalLoad')
                        : t('nominal')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
