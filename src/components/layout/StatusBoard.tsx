import { X, Activity, Flame, Car, CloudRain, Zap, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIncidents } from '../../hooks/useIncidents';
import { useEarthquakes } from '../../hooks/useEarthquakes';

interface StatusBoardProps {
  onClose: () => void;
}

export const StatusBoard = ({ onClose }: StatusBoardProps) => {
  const { t } = useTranslation();
  const { data: incidents } = useIncidents();
  const { data: earthquakes } = useEarthquakes();

  const counts = {
    fire: incidents?.filter(i => i.type === 'fire').length || 0,
    traffic: incidents?.filter(i => i.type === 'traffic' || i.type === 'jam').length || 0,
    power: incidents?.filter(i => i.type === 'power').length || 0,
    weather: incidents?.filter(i => i.type === 'weather').length || 0,
    notice: incidents?.filter(i => i.type === 'notice').length || 0,
    alert: incidents?.filter(i => i.type === 'alert').length || 0,
    earthquake: earthquakes?.length || 0,
  };

  const total = (incidents?.length || 0) + (earthquakes?.length || 0);

  const stats = [
    { label: 'Sismos (USGS)', count: counts.earthquake, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-200 dark:border-purple-800' },
    { label: 'Alertas Rojas', count: counts.alert, icon: Flame, color: 'text-red-600', bg: 'bg-red-500/10 border-red-200 dark:border-red-800' },
    { label: 'Incendios', count: counts.fire, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-200 dark:border-orange-800' },
    { label: 'Tránsito y Tacos', count: counts.traffic, icon: Car, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-200 dark:border-yellow-800' },
    { label: 'Clima Severo', count: counts.weather, icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-200 dark:border-blue-800' },
    { label: 'Cortes Luz', count: counts.power, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-200 dark:border-amber-800' },
    { label: 'Noticias Generales', count: counts.notice, icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-200 dark:border-indigo-800' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Resumen Nacional</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Situación global del país en tiempo real</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-8 flex items-center justify-center flex-col">
            <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
              {total}
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-2">
              Incidentes Activos Totales
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`p-4 rounded-2xl border ${stat.bg} flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}>
                  <Icon className={`w-8 h-8 ${stat.color} mb-3`} />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.count}</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wide">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
          >
            Volver al Mapa
          </button>
        </div>

      </div>
    </div>
  );
};
