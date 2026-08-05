import { useEffect, useState } from 'react';
import { useFilterStore } from '../../store/useFilterStore';
import { Cloud, Wind, Thermometer, Loader2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchCurrentWeather, fetchLocationName } from '../../api';

export const WeatherWidget = () => {
  const { t } = useTranslation();
  const { mapView, userLocationName, setUserLocationName } = useFilterStore();
  const [weather, setWeather] = useState<{temperature: number; windspeed: number} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeatherAndLocation = async () => {
      setLoading(true);
      try {
        const [currentWeather, locationName] = await Promise.all([
          fetchCurrentWeather(mapView.latitude, mapView.longitude).catch(() => null),
          fetchLocationName(mapView.latitude, mapView.longitude).catch(() => null)
        ]);
        
        if (currentWeather) {
          setWeather(currentWeather);
        }
        if (locationName) {
          setUserLocationName(locationName);
        }
      } catch (err) {
        console.error('Failed to fetch weather or location', err);
      } finally {
        setLoading(false);
      }
    };

    // Use a small timeout to avoid spamming the API on every pan/zoom tick
    const timeoutId = setTimeout(() => {
      fetchWeatherAndLocation();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [mapView.latitude, mapView.longitude, setUserLocationName]);

  if (!weather && !loading && !userLocationName) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2 max-w-[90vw]">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-800 rounded-xl px-3 
                      py-2 flex items-center gap-2 sm:gap-4 text-slate-800 dark:text-slate-200 max-w-full overflow-hidden">
        {loading && !weather ? (
          <div className="flex items-center gap-2 text-sm w-full justify-center text-blue-600 dark:text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-semibold text-xs uppercase tracking-wider">{t('app.loadingWeather') || 'Cargando...'}</span>
          </div>
        ) : weather ? (
          <>
            <div className="flex items-center gap-1.5" title={t('app.temp')}>
              <Thermometer className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-xs sm:text-sm">{weather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-1.5" title={t('app.wind')}>
              <Wind className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-xs sm:text-sm">{weather.windspeed} km/h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
                {t('app.currentWeather') || 'EN VIVO'}
              </span>
            </div>
          </>
        ) : null}
      </div>
      
      {userLocationName && (
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-bold px-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur rounded-lg py-1 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span className="truncate max-w-[200px] sm:max-w-[300px]">{userLocationName}</span>
        </div>
      )}
    </div>
  );
};
