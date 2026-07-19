import { useFilterStore } from '../../store/useFilterStore';
import { Flame, Car, Zap, AlertTriangle, CloudRain, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FILTERS = [
  { id: 'alert', i18nKey: 'filters.alert', icon: AlertTriangle, color: 'text-teal-500', bg: 'bg-teal-500' },
  { id: 'fire', i18nKey: 'filters.fire', icon: Flame, color: 'text-red-500', bg: 'bg-red-500' },
  { id: 'accident', i18nKey: 'filters.accident', icon: Car, color: 'text-orange-500', bg: 'bg-orange-500' },
  { id: 'utility', i18nKey: 'filters.utility', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  { id: 'rain', i18nKey: 'filters.rain', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-500' },
  { id: 'earthquake', i18nKey: 'filters.earthquake', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500' }
];

export const FloatingFilters = () => {
  const { t } = useTranslation();
  const { hiddenFilters, toggleFilter, setSelectedIncidentId } = useFilterStore();

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar pointer-events-auto">
      
      {/* Incident Types */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = !hiddenFilters.includes(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => {
                toggleFilter(filter.id);
                setSelectedIncidentId(null);
              }}
              title={t(filter.i18nKey) || filter.id}
              className={`p-3 rounded-xl transition-all ${
                isActive 
                  ? `${filter.bg} text-white shadow-md scale-105` 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>


    </div>
  );
};