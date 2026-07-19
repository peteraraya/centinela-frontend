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
    <div className="flex flex-col gap-2 mt-2">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-3 flex items-center justify-between text-blue-900 dark:text-blue-200">
        {loading && !weather ? (
          <div className="flex items-center gap-2 text-sm w-full justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('app.loadingWeather') || 'Cargando clima...'}</span>
          </div>
        ) : weather ? (
          <>
            <div className="flex items-center gap-1.5" title={t('app.temp')}>
              <Thermometer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-sm">{weather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-1.5" title={t('app.wind')}>
              <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-sm">{weather.windspeed} km/h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t('app.currentWeather') || 'CLIMA'}
              </span>
            </div>
          </>
        ) : null}
      </div>
      
      {userLocationName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{userLocationName}</span>
        </div>
      )}
    </div>
  );
};
