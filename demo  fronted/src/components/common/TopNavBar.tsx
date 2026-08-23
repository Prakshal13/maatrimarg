import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeLanguage, Language } from '../../context/ThemeLanguageContext';
import { useAuth } from '../../context/AuthContext';

interface TopNavBarProps {
  onToggleSidebar?: () => void;
}

interface NotificationItem {
  id: string;
  type: 'emergency' | 'capacity' | 'risk' | 'admin';
  title: string;
  description: string;
  time: string;
  path: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ onToggleSidebar }) => {
  const { language, setLanguage, theme, toggleTheme, t } = useThemeLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hospitals?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/command-center':
        return t('commandCenterTitle');
      case '/hospitals':
        return t('hospitalsDirectory');
      case '/risk-assessment':
        return t('maternalRiskAssessment');
      case '/admin':
        return t('adminGovernanceCenter');
      case '/analytics':
        return t('analyticsTitle');
      default:
        return t('commandCenter');
    }
  };

  const getNotifications = (): { header: string; count: string; items: NotificationItem[] } => {
    if (language === 'mr') {
      return {
        header: 'वैद्यकीय सूचना (Alerts)',
        count: '२ नवीन',
        items: [
          {
            id: 'n1',
            type: 'emergency',
            title: 'आपत्कालीन प्रसूती संदर्भ',
            description: 'युनिट ४A केईएम रुग्णालयाकडे रवाना. वेळ ४ मिनिटे.',
            time: '४ मिनिटांपूर्वी',
            path: '/command-center'
          },
          {
            id: 'n2',
            type: 'capacity',
            title: 'खाटांची संख्या अपडेट',
            description: 'नाशिक जिल्हा रुग्णालयात ४ ICU खाटा उपलब्ध झाल्या.',
            time: '१२ मिनिटांपूर्वी',
            path: '/hospitals?search=Nashik'
          },
          {
            id: 'n3',
            type: 'risk',
            title: 'उच्च जोखीम तपासणी अलर्ट',
            description: 'रूग्ण #PT-8812 साठी ICMR जोखीम स्कोअर: ७८/१००.',
            time: '२५ मिनिटांपूर्वी',
            path: '/risk-assessment'
          }
        ]
      };
    } else if (language === 'hi') {
      return {
        header: 'क्लिनिकल अलर्ट (Alerts)',
        count: '2 नए',
        items: [
          {
            id: 'n1',
            type: 'emergency',
            title: 'आपातकालीन प्रसूति डिस्पैच',
            description: 'यूनिट 4A केईएम अस्पताल के लिए रवाना। समय 4 मिनट।',
            time: '4 मिनट पहले',
            path: '/command-center'
          },
          {
            id: 'n2',
            type: 'capacity',
            title: 'बेड क्षमता अपडेट',
            description: 'नासिक जिला सिविल अस्पताल में 4 आईसीयू बेड उपलब्ध हुए।',
            time: '12 मिनट पहले',
            path: '/hospitals?search=Nashik'
          },
          {
            id: 'n3',
            type: 'risk',
            title: 'उच्च जोखिम मूल्यांकन अलर्ट',
            description: 'मरीज़ #PT-8812 का आईसीएमआर जोखिम स्कोर: 78/100.',
            time: '25 मिनट पहले',
            path: '/risk-assessment'
          }
        ]
      };
    }

    return {
      header: 'Clinical Alerts',
      count: '2 New',
      items: [
        {
          id: 'n1',
          type: 'emergency',
          title: 'Emergency Obstetric Dispatch',
          description: 'Unit 4A en route to KEM Hospital. ETA 4m.',
          time: '4m ago',
          path: '/command-center'
        },
        {
          id: 'n2',
          type: 'capacity',
          title: 'Network Capacity Update',
          description: 'Nashik District Civil added 4 available ICU beds.',
          time: '12m ago',
          path: '/hospitals?search=Nashik'
        },
        {
          id: 'n3',
          type: 'risk',
          title: 'High Risk Assessment Alert',
          description: 'Patient #PT-8812 flagged with ICMR Risk Score: 78/100.',
          time: '25m ago',
          path: '/risk-assessment'
        }
      ]
    };
  };

  const notifs = getNotifications();

  const handleNotificationClick = (item: NotificationItem) => {
    setShowNotifications(false);
    navigate(item.path);
  };

  return (
    <header className="h-16 w-full sticky top-0 z-30 bg-surface-container-lowest dark:bg-slate-900 border-b border-surface-border dark:border-slate-800 flex justify-between items-center px-4 md:px-margin-page transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w-xs md:max-w-sm hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-[18px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg text-body-md text-on-surface dark:text-slate-100 placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-teal-400 focus:border-transparent transition-all text-xs"
          />
        </form>

        {/* Current Active Context (Mobile/Compact) */}
        <span className="text-body-md font-semibold text-primary dark:text-slate-200 sm:hidden truncate text-xs">
          {getPageTitle()}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-surface-container-low dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg px-2 py-1 text-label-caps text-on-surface-variant dark:text-slate-300">
          <span className="material-symbols-outlined text-[16px] text-teal-accent">language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent border-none text-label-caps font-medium text-on-surface dark:text-slate-200 focus:ring-0 cursor-pointer py-0 pl-1 pr-4 outline-none text-xs"
          >
            <option value="en" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">English (EN)</option>
            <option value="mr" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">मराठी (MR)</option>
            <option value="hi" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">हिंदी (HI)</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 border border-surface-border dark:border-slate-700 transition-colors flex items-center justify-center"
          title={theme === 'dark' ? (language === 'mr' ? 'लाईट मोड' : language === 'hi' ? 'लाइट मोड' : 'Switch to Light Mode') : (language === 'mr' ? 'डार्क मोड' : language === 'hi' ? 'डार्क मोड' : 'Switch to Dark Mode')}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 rounded-lg border border-surface-border dark:border-slate-700 transition-colors relative flex items-center justify-center"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {showNotifications && (
            <>
              {/* Invisible backdrop to dismiss popover on outside click */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-surface-container-lowest dark:bg-slate-900 border border-surface-border dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-reveal">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-surface-border dark:border-slate-800">
                  <span className="text-label-caps font-bold text-primary dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary dark:text-teal-400 text-[18px]">notifications_active</span>
                    {notifs.header}
                  </span>
                  <span className="text-[11px] bg-secondary/10 text-secondary dark:text-teal-400 px-2.5 py-0.5 rounded-full font-semibold">
                    {notifs.count}
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                  {notifs.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3 rounded-xl border flex gap-3 items-start cursor-pointer transition-all hover:scale-[1.01] hover:shadow-sm active:scale-98 group ${
                        item.type === 'emergency'
                          ? 'bg-error-container/20 hover:bg-error-container/30 border-error/30'
                          : item.type === 'capacity'
                          ? 'bg-surface-container-low dark:bg-slate-800/80 hover:bg-surface-container dark:hover:bg-slate-800 border-surface-border dark:border-slate-700'
                          : 'bg-teal-500/10 hover:bg-teal-500/15 border-teal-500/30'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                          item.type === 'emergency'
                            ? 'text-error'
                            : item.type === 'capacity'
                            ? 'text-teal-accent'
                            : 'text-amber-500'
                        }`}
                      >
                        {item.type === 'emergency' ? 'warning' : item.type === 'capacity' ? 'domain' : 'psychiatry'}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-body-md font-bold text-on-surface dark:text-slate-100 text-xs group-hover:text-secondary dark:group-hover:text-teal-400 transition-colors">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-on-surface-variant dark:text-slate-400 font-mono">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant dark:text-slate-300 leading-snug">
                          {item.description}
                        </p>
                      </div>

                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all self-center">
                        arrow_forward_ios
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-surface-border dark:border-slate-800 flex justify-between items-center text-[11px]">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin');
                    }}
                    className="text-secondary dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                    {language === 'mr' ? 'सर्व ऑडिट नोंदी पहा' : language === 'hi' ? 'सभी ऑडिट लॉग देखें' : 'View Master Audit Log'}
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-white font-medium"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-border dark:border-slate-800">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-surface-border dark:border-slate-700 shrink-0 bg-primary-container text-white flex items-center justify-center font-semibold text-xs">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              'AD'
            )}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-body-md font-semibold text-primary dark:text-slate-200 text-xs leading-none">
              {user?.name || (language === 'mr' ? 'डॉ. अनन्या देशमुख' : language === 'hi' ? 'डॉ. अनन्या देशमुख' : 'Dr. Ananya Deshmukh')}
            </span>
            <span className="text-label-caps text-on-surface-variant dark:text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">
              {user?.id || 'MH-DOC-8492'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
