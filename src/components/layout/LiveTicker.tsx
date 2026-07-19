import { useEffect, useState } from 'react';
import { useIncidents } from '../../hooks/useIncidents';
import { useEarthquakes } from '../../hooks/useEarthquakes';
import { AlertCircle, ChevronRight, ChevronLeft, Pause, Play } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';

export const LiveTicker = () => {
  const { data: incidents } = useIncidents();
  const { data: earthquakes } = useEarthquakes();
  const { setFlyToLocation, setSelectedIncidentId } = useFilterStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Combine latest critical incidents and recent earthquakes
  const latestAlerts = [
    ...(incidents?.filter(i => i.severity === 'critical' || i.severity === 'high').map(i => ({
      id: i.id,
      title: i.title,
      desc: i.details?.affectedArea || i.description,
      isEq: false,
      coords: i.coordinates
    })) || []),
    ...(earthquakes?.slice(0, 3).map(eq => ({
      id: eq.id,
      title: `Sismo M${eq.properties.mag.toFixed(1)}`,
      desc: eq.properties.place,
      isEq: true,
      coords: eq.geometry.coordinates
    })) || [])
  ];

  useEffect(() => {
    if (latestAlerts.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % latestAlerts.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [latestAlerts.length, isPaused]);

  if (latestAlerts.length === 0) return null;

  const currentAlert = latestAlerts[currentIndex];

  return (
    <div 
      className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[95%] sm:w-11/12 max-w-2xl pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-gray-900/90 dark:bg-gray-100/90 backdrop-blur-md text-white dark:text-gray-900 rounded-xl sm:rounded-2xl shadow-2xl p-1 sm:pr-2 flex items-center gap-1.5 sm:gap-2 border border-white/10 dark:border-black/10 overflow-hidden">
        
        <div className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl flex items-center shrink-0 gap-1.5 whitespace-nowrap">
          <AlertCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!isPaused ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">ÚLTIMO MINUTO</span>
        </div>
        
        <div 
          onClick={() => {
            if (!currentAlert.isEq) setSelectedIncidentId(currentAlert.id);
            setFlyToLocation({ longitude: currentAlert.coords[0], latitude: currentAlert.coords[1], zoom: 12 });
          }}
          className="flex-1 min-w-0 overflow-hidden cursor-pointer hover:bg-white/5 dark:hover:bg-black/5 px-1.5 sm:px-2 py-1 rounded transition-colors"
          title="Ver en el mapa"
        >
          <div 
            key={currentAlert.id} 
            className="text-xs sm:text-sm font-medium truncate animate-in slide-in-from-bottom-2 fade-in duration-300"
          >
            <span className="text-red-400 dark:text-red-600 font-bold mr-1.5">{currentAlert.title}:</span>
            <span className="opacity-90">{currentAlert.desc}</span>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + latestAlerts.length) % latestAlerts.length); setIsPaused(true); }}
            className="p-2 sm:p-1.5 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
            className="p-2 sm:p-1.5 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center hidden sm:flex"
            title={isPaused ? "Reanudar" : "Pausar"}
          >
            {isPaused ? <Play className="w-4 h-4 opacity-70" /> : <Pause className="w-4 h-4 opacity-70" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % latestAlerts.length); setIsPaused(true); }}
            className="p-2 sm:p-1.5 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
