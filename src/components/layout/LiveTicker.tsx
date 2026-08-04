import { useEffect, useState } from 'react';
import { useNews } from '../../hooks/useNews';
import { ChevronRight, ChevronLeft, Pause, Play, Newspaper, X, Share2, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';

const playSiren = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.6);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.9);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.2);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch(e) {}
};

const playBell = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
};

const playBloop = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
};

export const LiveTicker = () => {
  const { data: news } = useNews();
  const { soundEnabled } = useFilterStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const seenAlertsRef = useRef<Set<string>>(new Set());

  // Use news directly, sorted by timestamp (assuming API returns sorted or we just use it as is)
  const latestAlerts = news?.slice(0, 50) || [];

  useEffect(() => {
    let newlyFoundAlert = null;
    latestAlerts.forEach(alert => {
      if (!seenAlertsRef.current.has(alert.id)) {
        seenAlertsRef.current.add(alert.id);
        newlyFoundAlert = alert;
      }
    });

    if (newlyFoundAlert && seenAlertsRef.current.size > latestAlerts.length) {
      // It's a truly new news alert after initial load
      if (soundEnabled) {
        const { type, severity } = newlyFoundAlert as any;
        if (severity === 'critical' || type === 'fire' || type === 'alert') {
          playSiren();
        } else if (type === 'notice' || type === 'traffic' || type === 'weather') {
          playBloop();
        } else {
          playBell();
        }
      }
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      // Volver al primer índice para mostrar la alerta nueva
      setCurrentIndex(0);
    }
  }, [latestAlerts, soundEnabled]);

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
    <>
    <div 
      className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 w-[95%] sm:w-11/12 max-w-4xl pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 rounded-xl sm:rounded-2xl shadow-2xl p-1.5 flex items-center gap-2 sm:gap-3 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
        onClick={() => {
          setSelectedNews(currentAlert);
          setIsPaused(true);
        }}
      >
        
        <div className="bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] sm:text-xs font-bold px-3 py-2 rounded-lg sm:rounded-xl flex items-center shrink-0 gap-1.5 whitespace-nowrap uppercase tracking-widest shadow-md">
          <Newspaper className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${!isPaused ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">Noticias Nacionales</span>
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden relative">
          <div 
            key={currentAlert.id} 
            className="text-xs sm:text-sm font-medium truncate animate-in slide-in-from-bottom-2 fade-in duration-300 flex items-center gap-2"
          >
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shrink-0 ${
              currentAlert.type === 'fire' ? 'bg-red-500' :
              currentAlert.type === 'traffic' ? 'bg-orange-500' :
              currentAlert.type === 'power' ? 'bg-amber-500' :
              currentAlert.type === 'weather' ? 'bg-blue-500' :
              currentAlert.type === 'alert' ? 'bg-teal-500' : 'bg-indigo-500'
            }`}>
              {currentAlert.type}
            </span>
            <span className="text-slate-900 dark:text-white font-bold">{currentAlert.title}</span>
            <span className="opacity-70 truncate hidden md:inline">- {currentAlert.description}</span>
          </div>
        </div>

        <div className="flex items-center shrink-0 pr-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + latestAlerts.length) % latestAlerts.length); setIsPaused(true); }}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hidden sm:flex"
            title={isPaused ? "Reanudar" : "Pausar"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % latestAlerts.length); setIsPaused(true); }}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>

    {selectedNews && (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-white ${
                selectedNews.type === 'fire' ? 'bg-red-500' :
                selectedNews.type === 'traffic' ? 'bg-orange-500' :
                selectedNews.type === 'power' ? 'bg-amber-500' :
                selectedNews.type === 'weather' ? 'bg-blue-500' :
                selectedNews.type === 'alert' ? 'bg-teal-500' : 'bg-indigo-500'
              }`}>
                {selectedNews.type}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {new Date(selectedNews.timestamp).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button 
              onClick={() => {
                setSelectedNews(null);
                setIsPaused(false);
              }}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mb-3">
              {selectedNews.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {selectedNews.description}
            </p>
            
            {selectedNews.details?.reportedBy && (
              <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuente</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedNews.details.reportedBy}</span>
              </div>
            )}
          </div>

          <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-4 h-4" /> Compartir Noticia
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const text = `📰 Noticia: ${selectedNews.title}\n\n${selectedNews.description}\n\nApp Centinela 🇨🇱`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const text = `📰 Noticia: ${selectedNews.title}\n\nApp Centinela 🇨🇱`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full transition-colors"
                title="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </button>
              <button 
                onClick={() => {
                  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://centinela.cl')}`;
                  window.open(url, '_blank');
                }}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full transition-colors"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
              <button 
                onClick={() => {
                  const text = `📰 Noticia: ${selectedNews.title}\n\n${selectedNews.description}\n\nApp Centinela 🇨🇱`;
                  navigator.clipboard.writeText(text);
                  toast.success('Texto copiado');
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full transition-colors"
                title="Copiar texto"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
