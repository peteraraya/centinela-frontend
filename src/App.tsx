import { useState, useEffect } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { Sidebar } from './components/layout/Sidebar';
import { Menu } from 'lucide-react';
import { useAccessibilityStore } from './store/useAccessibilityStore';
import { AccessibilityMenu } from './components/layout/AccessibilityMenu';
import { LiveTicker } from './components/layout/LiveTicker';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, fontSize } = useAccessibilityStore();

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

  // Simulate real-time push notification once on mount to show capability
  useEffect(() => {
    const timer = setTimeout(() => {
      toast('🚨 Nuevo Incendio Reportado en tu comuna', {
        icon: '⚠️',
        duration: 5000,
        style: {
          background: theme === 'dark' ? '#1f2937' : '#fff',
          color: theme === 'dark' ? '#f9fafb' : '#111827',
          border: '1px solid #ef4444'
        }
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative transition-colors duration-300">
      <Toaster position="top-right" />
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none w-full max-w-sm sm:w-96
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full w-full">
        <AccessibilityMenu />
        <MapContainer />
        <LiveTicker />
        
        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-blue-700 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default App;
