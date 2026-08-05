import { useFilterStore } from '../../store/useFilterStore';
import { SearchBar } from '../filters/SearchBar';
import { MapPin, Globe, ChevronDown, ChevronUp, X, Flame, Car, Zap, AlertTriangle, CloudRain, Activity, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIncidents } from '../../hooks/useIncidents';
import { useEarthquakes } from '../../hooks/useEarthquakes';
import type { Incident } from '../../types';
import type { Earthquake } from '../../hooks/useEarthquakes';
import { useRef, useState } from 'react';

import { Cone, Cross } from 'lucide-react';
import { useFarmacias } from '../../hooks/useFarmacias';

const FILTERS = [
  { id: 'alert', i18nKey: 'filters.alert', icon: AlertTriangle, color: 'text-teal-500' },
  { id: 'fire', i18nKey: 'filters.fire', icon: Flame, color: 'text-red-500' },
  { id: 'traffic', i18nKey: 'filters.accident', icon: Car, color: 'text-orange-500' },
  { id: 'jam', i18nKey: 'filters.jam', icon: Cone, color: 'text-rose-500' },
  { id: 'weather', i18nKey: 'filters.rain', icon: CloudRain, color: 'text-blue-500' },
  { id: 'notice', i18nKey: 'filters.notice', icon: Info, color: 'text-indigo-500' },
  { id: 'power', i18nKey: 'filters.power', icon: Zap, color: 'text-yellow-500' },
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
  const { hiddenFilters, hiddenSeverities, setFlyToLocation, selectedIncidentId, setSelectedIncidentId, setHoveredIncidentId, hoveredIncidentId, showFarmacias } = useFilterStore();
  const { data: incidents } = useIncidents();
  const { data: earthquakes } = useEarthquakes();
  const { data: farmacias } = useFarmacias();
  
  const [farmaciaComunaFilter, setFarmaciaComunaFilter] = useState('');
  const [soloDeTurno, setSoloDeTurno] = useState(true);

  const isFarmaciaDeTurno = (f: any) => {
    if (!f.horaApertura || !f.horaCierre) return false;
    const parseTime = (time: string) => {
      const parts = time.split(':').map(Number);
      return (parts[0] * 60) + (parts[1] || 0);
    };
    const start = parseTime(f.horaApertura);
    const end = parseTime(f.horaCierre);
    // Asume que si cierra a una hora menor o igual a la que abre (ej. abre 09:00, cierra 08:59 o 09:00 del otro día),
    // o si cierra durante la madrugada/mañana (<= 10:00 AM), está de turno nocturno.
    return end <= start || end <= (10 * 60); 
  };
  
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
    <div className="w-full h-full bg-slate-50 dark:bg-slate-900 xl:shadow-[2px_0_20px_-5px_rgba(0,0,0,0.1)] z-10 flex flex-col xl:border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Header Premium */}
      <div className="px-3 sm:px-4 pt-3 pb-3 sm:py-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-red-500" />
        
        {/* Mobile Drag Handle */}
        <div className="xl:hidden w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex flex-row items-start justify-between w-full relative z-10 gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold flex items-center gap-2 tracking-tight text-slate-900 dark:text-white">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="truncate">{t('app.title')}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mt-1.5 font-medium truncate">{t('app.subtitle')}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={toggleLanguage}
              className="p-1.5 w-[36px] h-[36px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
              title="Cambiar idioma / Change language"
            >
              <Globe className="w-4 h-4" />
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="xl:hidden p-1.5 w-[36px] h-[36px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
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

        {/* Safe Zone Radius Selector */}
        <section className="shrink-0 mb-2 sm:mb-3">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Radio de Zona Cero
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                {useFilterStore.getState().safeZoneRadiusKm} km
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              step="1"
              value={useFilterStore.getState().safeZoneRadiusKm}
              onChange={(e) => useFilterStore.getState().setSafeZoneRadiusKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium px-1">
              <span>1km</span>
              <span>50km</span>
              <span>100km</span>
            </div>
          </div>
        </section>

        {/* Farmacias Section */}
        {showFarmacias && farmacias && farmacias.length > 0 && (
          <section className="shrink-0 mb-4 flex flex-col min-h-0 max-h-72 border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="flex flex-col gap-2 p-3 border-b border-emerald-100 dark:border-emerald-800/50 bg-emerald-100/50 dark:bg-emerald-900/30">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Cross className="w-3.5 h-3.5" />
                  Farmacias
                  <span className="ml-1.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                    {farmacias.filter(f => soloDeTurno ? isFarmaciaDeTurno(f) : true).length}
                  </span>
                </h2>
                
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={soloDeTurno} 
                    onChange={(e) => setSoloDeTurno(e.target.checked)} 
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 bg-white border-emerald-300 dark:border-emerald-700 dark:bg-slate-800"
                  />
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Solo Turno</span>
                </label>
              </div>
              
              <input
                type="text"
                placeholder="Filtrar por comuna (Ej: Providencia)"
                value={farmaciaComunaFilter}
                onChange={(e) => setFarmaciaComunaFilter(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
              {farmacias
                .filter(f => soloDeTurno ? isFarmaciaDeTurno(f) : true)
                .filter(f => farmaciaComunaFilter === '' || f.comuna.toLowerCase().includes(farmaciaComunaFilter.toLowerCase()))
                .slice(0, 100) // Limit to 100 to prevent extreme lag
                .map((farmacia, idx) => {
                  const deTurno = isFarmaciaDeTurno(farmacia);
                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                        deTurno 
                          ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-600 hover:border-emerald-500' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                      onClick={() => {
                        setFlyToLocation({ longitude: farmacia.longitud, latitude: farmacia.latitud, zoom: 16 });
                        if (window.innerWidth < 768 && onClose) onClose();
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{farmacia.nombre}</h3>
                        {deTurno && <span className="shrink-0 bg-emerald-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Turno</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{farmacia.direccion}, {farmacia.comuna}</p>
                      <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">Apertura: {farmacia.horaApertura}</span>
                        <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Cierre: {farmacia.horaCierre}</span>
                      </div>
                    </div>
                  );
                })}
              {farmacias.filter(f => soloDeTurno ? isFarmaciaDeTurno(f) : true).filter(f => farmaciaComunaFilter === '' || f.comuna.toLowerCase().includes(farmaciaComunaFilter.toLowerCase())).length > 100 && (
                <div className="text-center text-[10px] font-medium text-emerald-600 py-1">
                  Se muestran las primeras 100. Usa el buscador para afinar.
                </div>
              )}
            </div>
          </section>
        )}

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

            {(!incidents || incidents.length === 0) && !earthquakes && (
              <div className="space-y-4 animate-pulse mt-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-slate-200 dark:bg-slate-800 rounded-xl h-24 w-full"></div>
                ))}
              </div>
            )}
            
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
                    {t(filterGroup.i18nKey) || (filterGroup.id === 'notice' ? 'Noticias Generales' : filterGroup.id)}
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
                      <p className="text-slate-400 dark:text-slate-500 font-medium italic pt-2 text-[10px]">
                        {t('incident.updated') || 'ACTUALIZADO'} {new Date(incident.details.lastUpdate).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
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
