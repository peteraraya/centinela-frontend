import { useRef, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useIncidents } from '../../hooks/useIncidents';
import { Flame, Car, Zap, AlertTriangle, CloudRain, Activity, Share2 } from 'lucide-react';

const createGeoJSONCircle = (center: [number, number], radiusInMeters: number, type: string) => {
  const points = 64;
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]); // close polygon

  let color = '#6b7280';
  if (type === 'fire') color = '#ef4444';
  if (type === 'accident') color = '#f97316';
  if (type === 'utility') color = '#eab308';
  if (type === 'rain') color = '#3b82f6';
  if (type === 'earthquake') color = '#a855f7';
  if (type === 'alert') color = '#14b8a6'; // teal-500
  
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret]
    },
    properties: {
      color
    }
  };
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'fire': return <Flame className="w-6 h-6 text-red-500" />;
    case 'accident': return <Car className="w-6 h-6 text-orange-500" />;
    case 'utility': return <Zap className="w-6 h-6 text-yellow-500" />;
    case 'rain': return <CloudRain className="w-6 h-6 text-blue-500" />;
    default: return <AlertTriangle className="w-6 h-6 text-gray-500" />;
  }
};

import { useTranslation } from 'react-i18next';
import { useFilterStore } from '../../store/useFilterStore';
import { useEarthquakes } from '../../hooks/useEarthquakes';
import type { Earthquake } from '../../hooks/useEarthquakes';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export const MapContainer = () => {
  const { t } = useTranslation();
  const { data: incidents, isLoading } = useIncidents();
  const { data: earthquakes } = useEarthquakes();
  const { hiddenFilters, mapView, setMapView, selectedIncidentId, setSelectedIncidentId, flyToLocation, setFlyToLocation, mapType } = useFilterStore();
  const { theme } = useAccessibilityStore();
  
  const mapRef = useRef<MapRef>(null);

  // Sync state selectedIncident to local for Popup rendering
  const selectedIncident = incidents?.find(i => i.id === selectedIncidentId) || null;

  const geoJsonData = useMemo(() => {
    const incidentFeatures = incidents
      ?.filter(i => !hiddenFilters.includes(i.type))
      .filter(i => i.radius)
      .map(i => createGeoJSONCircle(i.coordinates, i.radius!, i.type)) || [];

    const eqFeatures = !hiddenFilters.includes('earthquake') && earthquakes
      ? earthquakes.map(eq => createGeoJSONCircle([eq.geometry.coordinates[0], eq.geometry.coordinates[1]], Math.max(eq.properties.mag * 2000, 5000), 'earthquake'))
      : [];

    return {
      type: 'FeatureCollection',
      features: [...incidentFeatures, ...eqFeatures]
    };
  }, [incidents, earthquakes, hiddenFilters]);

  useEffect(() => {
    if (mapRef.current && flyToLocation) {
      mapRef.current.flyTo({
        center: [flyToLocation.longitude, flyToLocation.latitude],
        zoom: flyToLocation.zoom,
        duration: 1500
      });
      // Update global map view immediately so weather widget sees new coords
      setMapView(flyToLocation);
      // Consume the event
      setFlyToLocation(null);
    }
  }, [flyToLocation, setFlyToLocation, setMapView]);

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        initialViewState={mapView}
        onMove={evt => setMapView(evt.viewState)}
        mapStyle={{
          version: 8,
          sources: {
            basemap: {
              type: 'raster',
              tiles: [
                mapType === 'satellite' 
                  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  : theme === 'dark' 
                    ? 'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png'
                    : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
              ],
              tileSize: 256,
              attribution: mapType === 'satellite' ? 'Tiles &copy; Esri' : '&copy; OpenStreetMap contributors &copy; CARTO'
            }
          },
          layers: [
            {
              id: 'basemap',
              type: 'raster',
              source: 'basemap'
            }
          ]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <GeolocateControl position="bottom-right" />
        <NavigationControl position="bottom-right" />

        <Source id="affected-zones" type="geojson" data={geoJsonData as never}>
          <Layer
            id="affected-zones-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.2
            }}
          />
          <Layer
            id="affected-zones-line"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 2,
              'line-opacity': 0.8
            }}
          />
        </Source>

        {incidents?.filter(i => !hiddenFilters.includes(i.type)).map(incident => (
          <Marker
            key={incident.id}
            longitude={incident.coordinates[0]}
            latitude={incident.coordinates[1]}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedIncidentId(incident.id);
              setFlyToLocation({ longitude: incident.coordinates[0], latitude: incident.coordinates[1], zoom: 15 });
            }}
          >
            <div className="relative">
              {incident.severity === 'critical' && (
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
              )}
              <div className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform">
                {getIconForType(incident.type)}
              </div>
            </div>
          </Marker>
        ))}

        {!hiddenFilters.includes('earthquake') && earthquakes?.map((eq: Earthquake) => (
          <Marker
            key={eq.id}
            longitude={eq.geometry.coordinates[0]}
            latitude={eq.geometry.coordinates[1]}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setFlyToLocation({ longitude: eq.geometry.coordinates[0], latitude: eq.geometry.coordinates[1], zoom: 8 });
            }}
          >
            <div className="relative">
              {eq.properties.mag >= 5.0 && (
                <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75"></div>
              )}
              <div className="relative cursor-pointer bg-purple-100 dark:bg-purple-900 rounded-full p-1.5 shadow-md hover:scale-110 transition-transform border border-purple-300 dark:border-purple-600">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </Marker>
        ))}

        {selectedIncident && (
          <Popup
            longitude={selectedIncident.coordinates[0]}
            latitude={selectedIncident.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedIncidentId(null)}
            closeOnClick={false}
            className="dark-popup"
          >
            <div className="p-2 text-gray-900">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-lg">{selectedIncident.title}</h3>
                <button 
                  onClick={() => {
                    const text = `🚨 Emergencia: ${selectedIncident.title}\n📍 ${selectedIncident.description}\nhttps://maps.google.com/?q=${selectedIncident.coordinates[1]},${selectedIncident.coordinates[0]}`;
                    navigator.clipboard.writeText(text);
                    alert('Enlace y detalles copiados al portapapeles');
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-blue-600"
                  title="Compartir incidente"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{selectedIncident.description}</p>
              <div className="mt-2 text-xs font-semibold capitalize text-gray-500">
                {t('app.severity')}: <span className={{
                  critical: 'text-red-600',
                  high: 'text-orange-600',
                  medium: 'text-yellow-600',
                  low: 'text-green-600'
                }[selectedIncident.severity]}>{selectedIncident.severity}</span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center pointer-events-none transition-colors duration-300">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">
            {t('app.loading')}
          </div>
        </div>
      )}
    </div>
  );
};
