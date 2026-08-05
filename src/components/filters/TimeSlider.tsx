import { useFilterStore } from '../../store/useFilterStore';
import { Clock } from 'lucide-react';

export const TimeSlider = () => {
  const { timeFilterHours, setTimeFilterHours, panicMode } = useFilterStore();

  if (panicMode) return null;

  const options = [
    { label: '1H', value: 1 },
    { label: '12H', value: 12 },
    { label: '24H', value: 24 },
    { label: '7D', value: 24 * 7 },
    { label: '30D', value: 24 * 30 },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-20 z-20 pointer-events-auto">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-400" />
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilterHours(opt.value)}
              className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-colors ${
                timeFilterHours === opt.value
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
