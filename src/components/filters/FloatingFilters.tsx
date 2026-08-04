import { useFilterStore } from '../../store/useFilterStore';
import { Flame, Car, Zap, AlertTriangle, CloudRain, Activity, Info, Cone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { Focus, Volume2, VolumeX, BarChart3, Layers } from 'lucide-react';

const FILTERS = [
  { id: 'alert', i18nKey: 'filters.alert', icon: AlertTriangle, color: 'text-teal-500', bg: 'bg-teal-500', available: true },
  { id: 'fire', i18nKey: 'filters.fire', icon: Flame, color: 'text-red-500', bg: 'bg-red-500', available: true },
  { id: 'traffic', i18nKey: 'filters.accident', icon: Car, color: 'text-orange-500', bg: 'bg-orange-500', available: true },
  { id: 'jam', i18nKey: 'filters.jam', icon: Cone, color: 'text-rose-500', bg: 'bg-rose-500', available: true },
  { id: 'weather', i18nKey: 'filters.rain', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-500', available: true },
  { id: 'notice', i18nKey: 'filters.notice', icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-500', available: true },
  { id: 'power', i18nKey: 'filters.power', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500', available: true },
  { id: 'earthquake', i18nKey: 'filters.earthquake', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500', available: true }
];

import { useIncidents } from '../../hooks/useIncidents';
import { useEarthquakes } from '../../hooks/useEarthquakes';

export const FloatingFilters = () => {
  const { t } = useTranslation();
  const { hiddenFilters, toggleFilter, setSelectedIncidentId, setPanicMode, soundEnabled, setSoundEnabled, setShowStatusBoard, isHeatmap, setIsHeatmap } = useFilterStore();
  const { data: incidents } = useIncidents();
  const { data: earthquakes } = useEarthquakes();

  const isFilterAvailable = (id: string, manuallyDisabled: boolean) => {
    if (!manuallyDisabled) return false;
    if (id === 'earthquake') return earthquakes && earthquakes.length > 0;
    return incidents?.some(i => i.type === id) || false;
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar pointer-events-auto">
      
      {/* Incident Types */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-1 sm:gap-2">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          const hasData = isFilterAvailable(filter.id, filter.available);
          const isReallyAvailable = filter.available && hasData;
          const isActive = !hiddenFilters.includes(filter.id) && isReallyAvailable;
          
          return (
            <button
              key={filter.id}
              onClick={() => {
                if (!filter.available) {
                  toast.error(t('filters.notAvailable', 'Datos no disponibles. Pendiente integración con APIs oficiales.'), {
                    icon: '🚧',
                  });
                  return;
                }
                if (!hasData) {
                  toast.error(t('filters.noIncidents', 'No hay incidentes activos de este tipo en este momento.'), {
                    icon: 'ℹ️',
                  });
                  return;
                }
                toggleFilter(filter.id);
                setSelectedIncidentId(null);
              }}
              title={t(filter.i18nKey) || filter.id}
              className={`p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg sm:rounded-xl transition-all ${
                !isReallyAvailable 
                  ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  : isActive 
                    ? `${filter.bg} text-white shadow-md scale-105` 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          );
        })}
      </div>

      {/* Focus / Sound controls */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-1 sm:gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Silenciar alertas sonoras" : "Activar alertas sonoras"}
          className={`p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg sm:rounded-xl transition-all ${
            soundEnabled 
              ? 'bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700' 
              : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 opacity-60 hover:bg-slate-200'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        <button
          onClick={() => setPanicMode(true)}
          title="Modo Visión de Túnel (Ocultar UI)"
          className="p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg sm:rounded-xl transition-all bg-red-100 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
        >
          <Focus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() => setShowStatusBoard(true)}
          title="Ver Resumen Nacional"
          className="p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg sm:rounded-xl transition-all bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
        >
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() => setIsHeatmap(!isHeatmap)}
          title={isHeatmap ? "Ocultar Mapa de Calor" : "Ver Mapa de Calor"}
          className={`p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg sm:rounded-xl transition-all ${
            isHeatmap
              ? 'bg-amber-500 text-white shadow-md scale-105'
              : 'bg-slate-100 dark:bg-slate-800 text-amber-600 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

    </div>
  );
};
