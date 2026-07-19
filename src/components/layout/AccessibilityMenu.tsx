import { Moon, Sun, Eye, Type, Settings2, Map as MapIcon, Satellite } from 'lucide-react';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useFilterStore } from '../../store/useFilterStore';
import { useState } from 'react';

export const AccessibilityMenu = () => {
  const { theme, setTheme, fontSize, toggleFontSize } = useAccessibilityStore();
  const { mapType, setMapType } = useFilterStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Menú de accesibilidad"
        title="Opciones de Accesibilidad"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-1 w-48 animate-in fade-in zoom-in duration-200">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Visualización
            </span>
          </div>
          
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
              theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Sun className="w-4 h-4" /> Claro
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
              theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Moon className="w-4 h-4" /> Oscuro
          </button>

          <button
            onClick={() => setTheme('grayscale')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
              theme === 'grayscale' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Escala de grises para alto contraste y daltonismo"
          >
            <Eye className="w-4 h-4" /> Escala de grises
          </button>

          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 my-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tipo de Mapa
            </span>
          </div>

          <button
            onClick={() => setMapType('street')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
              mapType === 'street' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <MapIcon className="w-4 h-4" /> Calles
          </button>
          
          <button
            onClick={() => setMapType('satellite')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
              mapType === 'satellite' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Satellite className="w-4 h-4" /> Satélite
          </button>

          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 my-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Texto
            </span>
          </div>

          <button
            onClick={toggleFontSize}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors ${
              fontSize === 'large' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Type className="w-4 h-4" /> Texto Grande
          </button>
        </div>
      )}
    </div>
  );
};
