import React from 'react';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface HospitalFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedState: string;
  onStateChange: (val: string) => void;
  selectedDistrict: string;
  onDistrictChange: (val: string) => void;
  statesList: string[];
  districtsList: string[];
  onReset: () => void;
}

export const HospitalFilterToolbar: React.FC<HospitalFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  selectedDistrict,
  onDistrictChange,
  statesList,
  districtsList,
  onReset
}) => {
  const { t } = useThemeLanguage();

  return (
    <div className="p-4 border-b border-surface-border dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 flex flex-col md:flex-row gap-3 justify-between items-center transition-colors">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-9 pr-4 py-2 bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg text-body-md text-on-surface dark:text-slate-100 placeholder:text-outline-variant text-xs focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto items-center">
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full sm:w-auto bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
        >
          <option value="">{t('allStates')} ({statesList.length})</option>
          {statesList.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="w-full sm:w-auto bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-on-surface dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400"
        >
          <option value="">{t('allDistricts')} ({districtsList.length})</option>
          {districtsList.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>

        {(searchQuery || selectedState || selectedDistrict) && (
          <button
            onClick={onReset}
            className="px-3 py-2 border border-surface-border dark:border-slate-700 rounded-lg text-xs font-semibold text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
            {t('resetFilters')}
          </button>
        )}
      </div>
    </div>
  );
};
