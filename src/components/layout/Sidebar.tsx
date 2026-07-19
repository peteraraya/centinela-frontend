import { useFilterStore } from '../../store/useFilterStore';
import { SearchBar } from '../filters/SearchBar';
import { MapPin, Globe, ChevronDown, ChevronUp, X, Flame, Car, Zap, AlertTriangle, CloudRain, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIncidents } from '../../hooks/useIncidents';
import { useEarthquakes } from '../../hooks/useEarthquakes';
import type { Incident } from '../../types';
import type { Earthquake } from '../../hooks/useEarthquakes';
import { useRef } from 'react';

const FILTERS = [
  { id: 'alert', i18nKey: 'filters.alert', icon: AlertTriangle, color: 'text-teal-500' },
  { id: 'fire', i18nKey: 'filters.fire', icon: Flame, color: 'text-red-500' },
  { id: 'accident', i18nKey: 'filters.accident', icon: Car, color: 'text-orange-500' },
  { id: 'utility', i18nKey: 'filters.utility', icon: Zap, color: 'text-yellow-500' },
  { id: 'rain', i18nKey: 'filters.rain', icon: CloudRain, color: 'text-blue-500' },
  { id: 'earthquake', i18nKey: 'filters.earthquake', icon: Activity, color: 'text-purple-500' }
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

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { t, i18n } = useTranslation();
  const { hiddenFilters, hiddenSeverities, setFlyToLocation, selectedIncidentId, setSelectedIncidentId, setHoveredIncidentId, hoveredIncidentId } = useFilterStore();
  const { data: incidents } = useIncidents();
  const { data: earthquakes } = useEarthquakes();
  
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (id: string, coordinates: [number, number], zoom: number) => {
    setHoveredIncidentId(id);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      if (!selectedIncidentId || selectedIncidentId === id) {
        setFlyToLocation({ longitude: coordinates[0], latitude: coordinates[1], zoom });
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    setHoveredIncidentId(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es');
  };

  const filteredIncidents = incidents?.filter(i => !hiddenFilters.includes(i.type) && !hiddenSeverities.includes(i.severity)) || [];

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-900 shadow-[2px_0_20px_-5px_rgba(0,0,0,0.1)] z-10 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Header Premium */}
      <div className="px-4 sm:px-6 pt-5 pb-4 sm:py-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-red-500" />
        
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between w-full relative z-10 gap-3 sm:gap-0">
          <div className="mt-2 sm:mt-0">
            <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 tracking-tight text-slate-900 dark:text-white">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-sm shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {t('app.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2 font-medium">{t('app.subtitle')}</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
            <button 
              onClick={toggleLanguage}
              className="p-2 w-[44px] h-[44px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
              title="Cambiar idioma / Change language"
            >
              <Globe className="w-5 h-5" />
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="xl:hidden p-2 min-w-[44px] min-h-[44px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 pt-3 sm:pt-4 flex-1 overflow-y-auto flex flex-col gap-4 sm:gap-5 custom-scrollbar">
        
        {/* Search */}
        <section className="shrink-0 mb-1 sm:mb-2">
          <SearchBar onSearchComplete={() => {
            if (window.innerWidth < 768 && onClose) onClose();
          }} />
        </section>

        {/* Active Incidents Linear/Jira Style List */}
        <section className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-3 sm:mb-4 shrink-0">
            <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
              {t('app.activeIncidents') || 'Incidentes Activos'}
              <span className="ml-1.5 sm:ml-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold">
                {filteredIncidents.length + (!hiddenFilters.includes('earthquake') && earthquakes ? earthquakes.length : 0)}
              </span>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
            
            {!hiddenFilters.includes('earthquake') && earthquakes && earthquakes.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 pb-1.5 sm:pb-2 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 flex items-center gap-1.5 sm:gap-2">
                  <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500" />
                  {t('filters.earthquake')}
                </h3>
                {earthquakes.map((eq: Earthquake) => {
                  const isHovered = hoveredIncidentId === eq.id;
                  return (
              <div 
                key={eq.id} 
                className={`relative overflow-hidden p-3 pl-4 border rounded-xl transition-all cursor-pointer group ${
                  isHovered ? 'bg-slate-100 dark:bg-slate-800/80 border-purple-300 dark:border-purple-600 shadow-md scale-[1.02]' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md'
                }`}
                onClick={() => {
                  setFlyToLocation({ longitude: eq.geometry.coordinates[0], latitude: eq.geometry.coordinates[1], zoom: 8 });
                  if (window.innerWidth < 768 && onClose) onClose(); // Auto-close on mobile
                }}
                onMouseEnter={() => handleMouseEnter(eq.id, [eq.geometry.coordinates[0], eq.geometry.coordinates[1]], 8)}
                onMouseLeave={handleMouseLeave}
              >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isHovered ? 'w-2 bg-purple-600' : 'bg-purple-500'} transition-all`} />
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Sismo M{eq.properties.mag.toFixed(1)}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{eq.properties.place}</p>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">{new Date(eq.properties.time).toLocaleString()}</p>
                </div>
                )})}
              </div>
            )}
            
            {FILTERS.filter(f => f.id !== 'earthquake').map(filterGroup => {
              const groupIncidents = filteredIncidents.filter((i: Incident) => i.type === filterGroup.id);
              if (groupIncidents.length === 0) return null;
              
              return (
                <div key={filterGroup.id} className="space-y-2 sm:space-y-3">
                  <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 pb-1.5 sm:pb-2 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 flex items-center gap-1.5 sm:gap-2">
                    <filterGroup.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${filterGroup.color.split(' ')[0]}`} />
                    {t(filterGroup.i18nKey)}
                  </h3>
                  
                  {groupIncidents.map((incident: Incident) => {
                    const isSelected = selectedIncidentId === incident.id;
                    const isHovered = hoveredIncidentId === incident.id;
              
              return (
                <div 
                  key={incident.id} 
                  className={`relative overflow-hidden p-3 pl-4 border rounded-xl transition-all cursor-pointer group ${
                    isSelected ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-md' 
                    : isHovered ? 'bg-slate-50 dark:bg-slate-800/90 border-blue-300 dark:border-blue-600 shadow-md scale-[1.02]' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedIncidentId(incident.id);
                    setFlyToLocation({ longitude: incident.coordinates[0], latitude: incident.coordinates[1], zoom: 15 });
                    if (window.innerWidth < 768 && onClose) onClose(); // Auto-close on mobile when selecting
                  }}
                  onMouseEnter={() => handleMouseEnter(incident.id, [incident.coordinates[0], incident.coordinates[1]], 15)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(incident.severity)} ${isHovered && !isSelected ? 'w-2' : ''} transition-all`} />
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold text-sm transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{incident.title}</h3>
                    <div className="flex items-center gap-2">
                      {isSelected ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                    </div>
                  </div>
                  <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${isSelected ? '' : 'line-clamp-2'}`}>{incident.description}</p>
                  
                  {isSelected && incident.details && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.status') || 'ESTADO'}:</span> <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{incident.details.status}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.reportedBy') || 'REPORTE'}:</span> <span className="text-right font-medium">{incident.details.reportedBy}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.units') || 'UNIDADES'}:</span> <span className="font-medium">{incident.details.unitsDispatched}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-slate-700 dark:text-slate-400">{t('incident.affectedArea') || 'AFECTACIÓN'}:</span> <span className="text-right truncate max-w-[150px] font-medium">{incident.details.affectedArea}</span></div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium italic pt-2 text-[10px]">{t('incident.updated') || 'ACTUALIZADO'} {incident.details.lastUpdate}</p>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
            )})}

            {filteredIncidents.length === 0 && (hiddenFilters.includes('earthquake') || earthquakes?.length === 0) && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                {t('app.noIncidents') || 'No hay incidentes activos para los filtros seleccionados'}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
