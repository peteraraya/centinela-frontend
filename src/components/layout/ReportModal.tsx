import { useState } from 'react';
import { useFilterStore } from '../../store/useFilterStore';
import { X, MapPin, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportModal = () => {
  const { isReportModalOpen, setIsReportModalOpen, addUserReportedIncident } = useFilterStore();
  const [type, setType] = useState('fire');
  const [desc, setDesc] = useState('');
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  if (!isReportModalOpen) return null;

  const handleLocate = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.longitude, pos.coords.latitude]);
          setLocating(false);
          toast.success('Ubicación obtenida');
        },
        () => {
          toast.error('Error al obtener ubicación. Por favor permite el acceso al GPS.');
          setLocating(false);
        }
      );
    } else {
      toast.error('Geolocalización no soportada en tu navegador');
      setLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !coords) {
      toast.error('Por favor ingresa una descripción y obtén tu ubicación');
      return;
    }
    
    // Simulate network request
    const promise = new Promise((resolve) => setTimeout(resolve, 1500));
    toast.promise(promise, {
      loading: 'Enviando reporte a la central...',
      success: '¡Reporte recibido! Gracias por avisar.',
      error: 'Error al enviar reporte'
    });

    promise.then(() => {
      addUserReportedIncident({
        id: `user-rep-${Date.now()}`,
        title: '⚠️ Reporte Ciudadano',
        description: desc,
        type,
        severity: 'medium',
        coordinates: coords,
        timestamp: new Date().toISOString(),
        radius: 100,
        details: {
          status: 'Pendiente',
          reportedBy: 'Usuario App',
          unitsDispatched: 0,
          affectedArea: 'No especificada',
          lastUpdate: 'Ahora'
        }
      });
      setIsReportModalOpen(false);
      setDesc('');
      setCoords(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            🚨 Reportar Emergencia
          </h2>
          <button 
            onClick={() => setIsReportModalOpen(false)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Tipo de Incidente
            </label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
            >
              <option value="fire">🔥 Incendio</option>
              <option value="accident">🚗 Accidente de Tránsito</option>
              <option value="utility">⚡ Corte de Suministro</option>
              <option value="rain">🌧️ Inundación / Lluvia</option>
              <option value="other">⚠️ Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              ¿Dónde estás?
            </label>
            <button
              type="button"
              onClick={handleLocate}
              className={`w-full p-3 flex items-center justify-center gap-2 rounded-xl border transition-all ${
                coords ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
              {coords ? 'Ubicación GPS fijada' : 'Obtener mi ubicación actual'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Detalles / Descripción
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="¿Qué está pasando? ¿Hay heridos?"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none h-24"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={locating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" /> Enviar Reporte Oficial
          </button>
          
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-2">
            El mal uso de esta herramienta está penado por la ley.
          </p>
        </form>
      </div>
    </div>
  );
};
