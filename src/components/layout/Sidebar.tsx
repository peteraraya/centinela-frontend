import { useFilterStore } from '../../store/useFilterStore';
import { SearchBar } from '../filters/SearchBar';
import { Flame, Car, Zap, AlertTriangle, CloudRain, MapPin, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIncidents } from '../../hooks/useIncidents';
import type { Incident } from '../../types';
import { Activity } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import { useEarthquakes } from '../../hooks/useEarthquakes';
import type { Earthquake } from '../../hooks/useEarthquakes';

const FILTERS = [
  { 
    id: 'alert', i18nKey: 'filters.alert', icon: AlertTriangle, color: 'text-teal-500',
    activeClass: 'bg-teal-500 text-white border-teal-500 shadow-sm dark:bg-teal-500/20 dark:border-teal-500/30 dark:text-teal-400',
    inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
  },
  { 
    id: 'fire', i18nKey: 'filters.fire', icon: Flame, color: 'text-red-500',
    activeClass: 'bg-red-500 text-white border-red-500 shadow-sm dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',
    inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
  },
  { 
    id: 'accident', i18nKey: 'filters.accident', icon: Car, color: 'text-orange-500',
    activeClass: 'bg-orange-500 text-white border-orange-500 shadow-sm dark:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-400',
    inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
  },
  { 
    id: 'utility', i18nKey: 'filters.utility', icon: Zap, color: 'text-yellow-500',
    activeClass: 'bg-yellow-500 text-white border-yellow-500 shadow-sm dark:bg-yellow-500/20 dark:border-yellow-500/30 dark:text-yellow-400',
    inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
  },
  { 
    id: 'rain', i18nKey: 'filters.rain', icon: CloudRain, color: 'text-blue-500',
    activeClass: 'bg-blue-500 text-white border-blue-500 shadow-sm dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400',
    inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
  },
  { 
    id: 'earthquake', i18nKey: 'filters.earthquake', icon: Activity, color: 'text-purple-500',
    activeClass: 'bg-purple-500 text-white border-purple-500 shadow-sm dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-400',
    inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

import { ChevronDown, ChevronUp, X } from 'lucide-react';

const Switch = ({ checked, onChange, activeColor = 'bg-blue-500' }: { checked: boolean, onChange: () => void, activeColor?: string }) => (
  <div 
    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? activeColor : 'bg-slate-300 dark:bg-slate-700'}`}
    onClick={(e) => { e.preventDefault(); onChange(); }}
  >
    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
);

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { t, i18n } = useTranslation();
  const { hiddenFilters, toggleFilter, setFlyToLocation, selectedIncidentId, setSelectedIncidentId } = useFilterStore();
  const { data: incidents } = useIncidents();
  const { data: earthquakes } = useEarthquakes();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es');
  };

  const filteredIncidents = incidents?.filter(i => !hiddenFilters.includes(i.type)) || [];

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-900 shadow-[2px_0_20px_-5px_rgba(0,0,0,0.1)] z-10 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Header Premium */}
      <div className="px-6 py-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-red-500" />
        
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden absolute top-6 right-16 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={toggleLanguage}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
          title="Cambiar idioma / Change language"
        >
          <Globe className="w-4 h-4" />
        </button>

        <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight text-slate-900 dark:text-white">
          <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          {t('app.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">{t('app.subtitle')}</p>
      </div>

      <div className="p-6 pt-2 flex-1 overflow-y-auto flex flex-col gap-8 custom-scrollbar">
        
        {/* Location & Weather */}
        <section>
          <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{t('app.location')}</h2>
          <SearchBar onSearchComplete={() => {
            if (window.innerWidth < 768 && onClose) onClose();
          }} />
          <WeatherWidget />
        </section>

        {/* Unambiguous Toggle Filters */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('app.filters')}</h2>
            {hiddenFilters.length > 0 && (
              <button 
                onClick={() => useFilterStore.setState({ hiddenFilters: [] })}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 uppercase tracking-wider"
              >
                Mostrar Todos
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm">
            {FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = !hiddenFilters.includes(filter.id);
              const activeColor = filter.id === 'fire' ? 'bg-red-500' : 
                                 filter.id === 'accident' ? 'bg-orange-500' : 
                                 filter.id === 'utility' ? 'bg-yellow-500' : 
                                 filter.id === 'alert' ? 'bg-teal-500' :
                                 filter.id === 'rain' ? 'bg-blue-500' : 'bg-purple-500';
              
              return (
                <label 
                  key={filter.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? filter.activeClass.split(' ')[0] + ' ' + filter.activeClass.split(' ')[4] : 'bg-slate-100 dark:bg-slate-800'} transition-colors`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500'}`}>
                      {t(filter.i18nKey)}
                    </span>
                  </div>
                  <Switch checked={isActive} onChange={() => toggleFilter(filter.id)} activeColor={activeColor} />
                </label>
              );
            })}
          </div>
        </section>

        {/* Active Incidents Linear/Jira Style List */}
        <section className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
              {t('app.activeIncidents')}
              <span className="ml-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {filteredIncidents.length + (!hiddenFilters.includes('earthquake') && earthquakes ? earthquakes.length : 0)}
              </span>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
            
            {!hiddenFilters.includes('earthquake') && earthquakes && earthquakes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-purple-500" />
                  {t('filters.earthquake')}
                </h3>
                {earthquakes.map((eq: Earthquake) => (
              <div 
                key={eq.id} 
                className="relative overflow-hidden p-3 pl-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  setFlyToLocation({ longitude: eq.geometry.coordinates[0], latitude: eq.geometry.coordinates[1], zoom: 8 });
                  if (window.innerWidth < 768 && onClose) onClose(); // Auto-close on mobile
                }}
              >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Sismo M{eq.properties.mag.toFixed(1)}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{eq.properties.place}</p>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">{new Date(eq.properties.time).toLocaleString()}</p>
                </div>
                ))}
              </div>
            )}
            
            {FILTERS.filter(f => f.id !== 'earthquake').map(filterGroup => {
              const groupIncidents = filteredIncidents.filter((i: Incident) => i.type === filterGroup.id);
              if (groupIncidents.length === 0) return null;
              
              return (
                <div key={filterGroup.id} className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 flex items-center gap-2">
                    <filterGroup.icon className={`w-3.5 h-3.5 ${filterGroup.color.split(' ')[0]}`} />
                    {t(filterGroup.i18nKey)}
                  </h3>
                  
                  {groupIncidents.map((incident: Incident) => {
                    const isSelected = selectedIncidentId === incident.id;
              
              return (
                <div 
                  key={incident.id} 
                  className={`relative overflow-hidden p-3 pl-4 border rounded-xl transition-all cursor-pointer group ${
                    isSelected ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedIncidentId(incident.id);
                    setFlyToLocation({ longitude: incident.coordinates[0], latitude: incident.coordinates[1], zoom: 15 });
                    if (window.innerWidth < 768 && onClose) onClose(); // Auto-close on mobile when selecting
                  }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(incident.severity)}`} />
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold text-sm transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{incident.title}</h3>
                    <div className="flex items-center gap-2">
                      {isSelected ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                    </div>
                  </div>
                  <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${isSelected ? '' : 'line-clamp-2'}`}>{incident.description}</p>
                  
                  {isSelected && incident.details && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.status')}:</span> <span className="font-medium">{incident.details.status}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.reportedBy')}:</span> <span className="text-right">{incident.details.reportedBy}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.units')}:</span> <span>{incident.details.unitsDispatched}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.affectedArea')}:</span> <span className="text-right truncate max-w-[150px]">{incident.details.affectedArea}</span></div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium italic pt-2 text-[10px]">{t('incident.updated')} {incident.details.lastUpdate}</p>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
            )})}

            {filteredIncidents.length === 0 && (hiddenFilters.includes('earthquake') || earthquakes?.length === 0) && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                {t('app.noIncidents')}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
