import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, Phone, X, ShieldAlert, Mail, ChevronDown } from 'lucide-react';



const FAQAccordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="font-bold text-slate-900 dark:text-white text-xs">{question}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
          {answer}
        </div>
      </div>
    </div>
  );
};

const SupportModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                {t('support')}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Help & Protocol Assistance
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-4 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 mb-1">
                Emergency Dispatch Protocol
              </h4>
              <p className="text-xs text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
                {t('support_alert') || "For critical maternal or pediatric emergencies, bypass standard routing and immediately dial the 108 Central Dispatch."}
              </p>
              <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm w-full justify-center">
                <Phone className="w-4 h-4" />
                Call 108 Emergency
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex gap-3">
            <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">
                District CMO Command HQ
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                For administrative support, roster updates, or capacity management issues, contact your regional Command Center desk.
              </p>
              <button className="mt-3 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors shadow-sm w-full">
                Email Support Team
              </button>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              {t('faq_title')}
            </h4>
            <div className="flex flex-col gap-2">
              <FAQAccordion question={t('faq_q1')} answer={t('faq_a1')} />
              <FAQAccordion question={t('faq_q2')} answer={t('faq_a2')} />
              <FAQAccordion question={t('faq_q3')} answer={t('faq_a3')} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SupportModal;
