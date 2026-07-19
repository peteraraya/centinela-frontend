/**
 * Centralized API services for Emergencias Map.
 * 
 * NOTA SOBRE APIs EN CHILE:
 * Actualmente no existen APIs gubernamentales 100% abiertas, gratuitas y estandarizadas (CORS-enabled) 
 * para consultar emergencias en tiempo real en Chile sin requerir llaves de acceso, scraping o convenios especiales.
 * 
 * Posibles integraciones futuras para Chile (requieren backend/scraping o llaves privadas):
 * 1. SENAPRED (Ex ONEMI): No posee API pública abierta, pero se pueden hacer parsers (scrapers) de sus feeds RSS de Alertas Rojas.
 * 2. Bomberos de Chile (Cuerpo de Bomberos): Las centrales de despacho (como CBV o CBS) publican en Twitter. Se puede usar la API de X/Twitter para leer despachos.
 * 3. SEC (Superintendencia de Electricidad y Combustibles): Poseen un mapa de cortes de luz, el cual puede ser consumido analizando las peticiones de su portal web (requiere backend proxy para evadir CORS).
 * 4. CONAF: Incendios forestales activos. A veces publican en capas de ArcGIS REST (Feature Servers) públicas que pueden ser leídas.
 * 
 * APIs Gratuitas e Internacionales utilizadas en este proyecto:
 * - USGS (United States Geological Survey): Para Sismos y Terremotos mundiales (filtro de Chile aplicado en cliente).
 * - Open-Meteo: Para el clima en tiempo real basado en coordenadas (Totalmente gratuita, sin API Key).
 * - Nominatim (OpenStreetMap): Geocodificación inversa y búsqueda de ciudades/calles (Gratuita, sujeta a rate-limits).
 */

/**
 * Busca coordenadas y datos de una ubicación usando Nominatim (OSM).
 * Limitado a resultados en Chile.
 * 
 * @param query Texto de búsqueda (ej. "Valparaíso", "Av. Providencia")
 * @returns Array de resultados de búsqueda con latitud y longitud.
 */
export const fetchLocationQuery = async (query: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=cl&limit=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al buscar ubicación');
  return await response.json();
};

/**
 * Obtiene el clima en tiempo real para una coordenada específica usando Open-Meteo.
 * 
 * @param lat Latitud
 * @param lon Longitud
 * @returns Objeto con los datos del clima actual (temperatura, velocidad del viento, etc.)
 */
export const fetchCurrentWeather = async (lat: number, lon: number) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener el clima');
  const data = await response.json();
  return data.current_weather;
};

/**
 * Obtiene los últimos sismos globales mayores a Magnitud 4.5 en el último mes.
 * La fuente de datos es el USGS de Estados Unidos.
 * 
 * @returns GeoJSON FeatureCollection con los sismos.
 */
export const fetchUSGSEarthquakes = async () => {
  const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error de red al obtener sismos USGS');
  return await response.json();
};

/**
 * Obtiene los incidentes desde el backend principal de la aplicación.
 * El backend consolida y normaliza datos de Bomberos, SENAPRED, SEC, y CONAF.
 */
export const fetchBackendIncidents = async () => {
  const url = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1') + '/incidents';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener incidentes del backend');
  return await response.json();
};
