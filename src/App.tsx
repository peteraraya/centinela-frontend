import { useState, useEffect } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { Sidebar } from './components/layout/Sidebar';
import { Menu } from 'lucide-react';
import { useAccessibilityStore } from './store/useAccessibilityStore';
import { AccessibilityMenu } from './components/layout/AccessibilityMenu';
import { LiveTicker } from './components/layout/LiveTicker';
import { WeatherWidget } from './components/layout/WeatherWidget';
import { FloatingFilters } from './components/filters/FloatingFilters';
import { TimeSlider } from './components/filters/TimeSlider';
import { StatusBoard } from './components/layout/StatusBoard';
import { Toaster, toast } from 'react-hot-toast';
import { useFilterStore } from './store/useFilterStore';
import { Focus, WifiOff } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, fontSize } = useAccessibilityStore();
  const { setSelectedIncidentId, panicMode, setPanicMode, showStatusBoard, setShowStatusBoard, userLocation, setUserLocation, setFlyToLocation } = useFilterStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      // Pedir ubicación al inicio para Zona Cero
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          setUserLocation(loc);
          setFlyToLocation({ ...loc, zoom: 12 });
          
          try {
            const { fetchLocationName } = await import('./api');
            const name = await fetchLocationName(loc.latitude, loc.longitude);
            if (name) useFilterStore.getState().setUserLocationName(name);
            toast.success(`Zona Cero establecida en ${name || 'tu ubicación'}`);
          } catch (e) {
            toast.success('Ubicación obtenida para Zona Cero');
          }
        },
        (error) => {
          console.log('Geolocalización denegada o no disponible', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    
    // Theme application
    html.classList.remove('dark', 'grayscale-mode');
    if (theme === 'dark') html.classList.add('dark');
    if (theme === 'grayscale') html.classList.add('grayscale-mode');
    
    // Font size application
    html.classList.remove('text-base', 'text-lg');
    html.classList.add(fontSize === 'large' ? 'text-lg' : 'text-base');
  }, [theme, fontSize]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          },
        }}
      />
      
      {/* Offline Survival Banner */}
      {isOffline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-orange-100/95 dark:bg-orange-900/95 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700 px-4 py-3 rounded-2xl shadow-xl w-[90%] max-w-md flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-4">
          <WifiOff className="w-5 h-5 shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
          <div className="flex flex-col">
            <span className="font-bold text-sm">Sin conexión a Internet</span>
            <span className="text-xs mt-0.5 opacity-90 leading-snug">
              Modo supervivencia activo. Estás viendo los últimos incidentes guardados en tu dispositivo antes del corte de red.
            </span>
          </div>
        </div>
      )}

      {showStatusBoard && <StatusBoard onClose={() => setShowStatusBoard(false)} />}

      {/* Panic Mode Exit Button */}
      {panicMode && (
        <button 
          onClick={() => setPanicMode(false)}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center gap-2 hover:bg-red-700 transition-all animate-pulse"
        >
          <Focus className="w-5 h-5" />
          Salir de Visión de Túnel
        </button>
      )}

      {/* Backdrop for mobile */}
      {isSidebarOpen && !panicMode && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 xl:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!panicMode && (
        <div className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
          xl:relative xl:transform-none w-full max-w-sm sm:w-80
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Map Area */}
      <div 
        className="flex-1 relative h-full w-full"
        onClick={(e) => {
          // Si el click ocurre directamente en el contenedor, cierra el popup
          if (e.target === e.currentTarget) {
            setSelectedIncidentId(null);
          }
        }}
      >
        {!panicMode && <AccessibilityMenu />}
        <MapContainer />
        {!panicMode && <LiveTicker />}
        
      {/* Floating Weather Widget (Above Ticker) */}
      {!panicMode && (
        <div className="absolute bottom-32 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-300">
          <WeatherWidget />
        </div>
      )}

        {/* Floating Right Filters */}
        {!panicMode && <FloatingFilters />}
        {!panicMode && <TimeSlider />}

        {/* Mobile Toggle Button */}
        {!panicMode && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="xl:hidden absolute top-4 left-4 z-20 bg-white dark:bg-gray-800 p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-blue-700 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

    </div>
  );
}

export default App;
