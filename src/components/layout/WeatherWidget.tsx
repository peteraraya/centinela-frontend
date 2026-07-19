import { useEffect, useState } from 'react';
import { useFilterStore } from '../../store/useFilterStore';
import { Cloud, Wind, Thermometer, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchCurrentWeather } from '../../api';

export const WeatherWidget = () => {
  const { t } = useTranslation();
  const { mapView } = useFilterStore();
  const [weather, setWeather] = useState<{temperature: number; windspeed: number} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const currentWeather = await fetchCurrentWeather(mapView.latitude, mapView.longitude);
        if (currentWeather) {
          setWeather(currentWeather);
        }
      } catch (err) {
        console.error('Failed to fetch weather', err);
      } finally {
        setLoading(false);
      }
    };

    // Use a small timeout to avoid spamming the API on every pan/zoom tick
    const timeoutId = setTimeout(() => {
      fetchWeather();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [mapView.latitude, mapView.longitude]);

  if (!weather && !loading) return null;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between text-blue-900 mt-2">
      {loading ? (
        <div className="flex items-center gap-2 text-sm w-full justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('app.loadingWeather')}</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5" title={t('app.temp')}>
            <Thermometer className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">{weather?.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1.5" title={t('app.wind')}>
            <Wind className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">{weather?.windspeed} km/h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium uppercase tracking-wide">
              {t('app.currentWeather')}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
