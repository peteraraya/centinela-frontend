import { useRef, useEffect, useMemo, useState } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useIncidents } from '../../hooks/useIncidents';
import { Flame, Car, Zap, AlertTriangle, CloudRain, Activity, Link as LinkIcon, MapPin } from 'lucide-react';
import useSupercluster from 'use-supercluster';

type BBox = [number, number, number, number];

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
import type { Incident } from '../../types';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export const MapContainer = () => {
  const { t } = useTranslation();
  const { data: incidents, isLoading } = useIncidents();
  const { data: earthquakes } = useEarthquakes();
  const { hiddenFilters, mapView, setMapView, selectedIncidentId, setSelectedIncidentId, flyToLocation, setFlyToLocation, mapType, hoveredIncidentId } = useFilterStore();
  const { theme } = useAccessibilityStore();
  
  const mapRef = useRef<MapRef>(null);

  // Sync state selectedIncident to local for Popup rendering
  const selectedIncident = incidents?.find(i => i.id === selectedIncidentId) || null;

  const points = useMemo(() => {
    const incidentPoints = incidents
      ?.filter(i => !hiddenFilters.includes(i.type))
      .map(incident => ({
        type: 'Feature' as const,
        properties: { cluster: false, incidentId: incident.id, category: 'incident', incident },
        geometry: {
          type: 'Point' as const,
          coordinates: [incident.coordinates[0], incident.coordinates[1]]
        }
      })) || [];

    const eqPoints = (!hiddenFilters.includes('earthquake') && earthquakes)
      ? earthquakes.map(eq => ({
          type: 'Feature' as const,
          properties: { cluster: false, earthquakeId: eq.id, category: 'earthquake', eq },
          geometry: {
            type: 'Point' as const,
            coordinates: [eq.geometry.coordinates[0], eq.geometry.coordinates[1]]
          }
        }))
      : [];

    return [...incidentPoints, ...eqPoints];
  }, [incidents, earthquakes, hiddenFilters]);

  const [bounds, setBounds] = useState<BBox | null>(null);
  const [zoom, setZoom] = useState(mapView.zoom);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds ? bounds : undefined,
    zoom,
    options: { radius: 75, maxZoom: 20 }
  });

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
        onLoad={(e) => {
          const b = e.target.getBounds();
          setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
          setZoom(e.target.getZoom());
        }}
        onMove={evt => {
          setMapView(evt.viewState);
          const b = evt.target.getBounds();
          setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
          setZoom(evt.target.getZoom());
        }}
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

        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties as { cluster?: boolean; point_count?: number; category?: string; incident?: Incident; eq?: Earthquake; earthquakeId?: string };

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  const expansionZoom = Math.min(
                    supercluster?.getClusterExpansionZoom(cluster.id as number) || 20,
                    20
                  );
                  mapRef.current?.flyTo({
                    center: [longitude, latitude],
                    zoom: expansionZoom,
                    duration: 500
                  });
                }}
              >
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform cursor-pointer">
                  {pointCount}
                </div>
              </Marker>
            );
          }

          if (cluster.properties.category === 'incident') {
            const incident = cluster.properties.incident;
            const isHovered = hoveredIncidentId === incident.id;
            return (
              <Marker
                key={`incident-${incident.id}`}
                longitude={incident.coordinates[0]}
                latitude={incident.coordinates[1]}
                style={{ zIndex: isHovered ? 10 : 1 }}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedIncidentId(incident.id);
                  setFlyToLocation({ longitude: incident.coordinates[0], latitude: incident.coordinates[1], zoom: 15 });
                }}
              >
                <div className={`relative transition-transform duration-300 ${isHovered ? 'scale-125' : 'hover:scale-110'}`}>
                  {(incident.severity === 'critical' || isHovered) && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isHovered ? 'bg-blue-400' : 'bg-red-500'}`}></div>
                  )}
                  <div className={`relative cursor-pointer bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border ${isHovered ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'}`}>
                    {getIconForType(incident.type)}
                  </div>
                </div>
              </Marker>
            );
          }

          if (cluster.properties.category === 'earthquake') {
            const eq = cluster.properties.eq;
            const isHovered = hoveredIncidentId === eq.id;
            return (
              <Marker
                key={`eq-${eq.id}`}
                longitude={eq.geometry.coordinates[0]}
                latitude={eq.geometry.coordinates[1]}
                style={{ zIndex: isHovered ? 10 : 1 }}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setFlyToLocation({ longitude: eq.geometry.coordinates[0], latitude: eq.geometry.coordinates[1], zoom: 8 });
                }}
              >
                <div className={`relative transition-transform duration-300 ${isHovered ? 'scale-125' : 'hover:scale-110'}`}>
                  {(eq.properties.mag >= 5.0 || isHovered) && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isHovered ? 'bg-blue-400' : 'bg-purple-500'}`}></div>
                  )}
                  <div className={`relative cursor-pointer bg-purple-100 dark:bg-purple-900 rounded-full p-1.5 shadow-md border ${isHovered ? 'border-blue-500 dark:border-blue-400' : 'border-purple-300 dark:border-purple-600'}`}>
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                  </div>
                </div>
              </Marker>
            );
          }
          
          return null;
        })}

        {selectedIncident && (
          <Popup
            longitude={selectedIncident.coordinates[0]}
            latitude={selectedIncident.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedIncidentId(null)}
            closeOnClick={false}
            className="custom-popup"
            maxWidth="320px"
          >
            <div className="p-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800`}>
                  {getIconForType(selectedIncident.type)}
                </div>
                <h3 className="font-bold text-base leading-tight text-slate-900 dark:text-white">{selectedIncident.title}</h3>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                {selectedIncident.description}
              </p>

              <div className="flex items-center gap-2 mt-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase">Compartir:</span>
                <button 
                  onClick={() => {
                    const text = `🚨 Emergencia: ${selectedIncident.title}\n📍 ${selectedIncident.description}\nhttps://maps.google.com/?q=${selectedIncident.coordinates[1]},${selectedIncident.coordinates[0]}`;
                    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                  }}
                  className="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors"
                  title="Compartir en WhatsApp"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                </button>
                <button 
                  onClick={() => {
                    const text = `🚨 Emergencia: ${selectedIncident.title}\n📍 ${selectedIncident.description}`;
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(`https://maps.google.com/?q=${selectedIncident.coordinates[1]},${selectedIncident.coordinates[0]}`)}`;
                    window.open(url, '_blank');
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                  title="Compartir en X (Twitter)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </button>
                <button 
                  onClick={() => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://maps.google.com/?q=${selectedIncident.coordinates[1]},${selectedIncident.coordinates[0]}`)}`;
                    window.open(url, '_blank');
                  }}
                  className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                  title="Compartir en Facebook"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button 
                  onClick={() => {
                    const text = `🚨 Emergencia: ${selectedIncident.title}\n📍 ${selectedIncident.description}\nhttps://maps.google.com/?q=${selectedIncident.coordinates[1]},${selectedIncident.coordinates[0]}`;
                    navigator.clipboard.writeText(text);
                    alert('Enlace y detalles copiados al portapapeles');
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center gap-1"
                  title="Copiar enlace"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>

              {selectedIncident.details && (
                <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] tracking-wider text-slate-400 dark:text-slate-500 uppercase">{t('incident.status') || 'ESTADO'}:</span> 
                    <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{selectedIncident.details.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] tracking-wider text-slate-400 dark:text-slate-500 uppercase">{t('incident.reportedBy') || 'REPORTE'}:</span> 
                    <span className="text-right font-medium">{selectedIncident.details.reportedBy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] tracking-wider text-slate-400 dark:text-slate-500 uppercase">{t('incident.units') || 'UNIDADES'}:</span> 
                    <span className="font-medium">{selectedIncident.details.unitsDispatched}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] tracking-wider text-slate-400 dark:text-slate-500 uppercase">{t('incident.affectedArea') || 'AFECTACIÓN'}:</span> 
                    <span className="text-right truncate max-w-[150px] font-medium">{selectedIncident.details.affectedArea}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-[10px] tracking-wider text-slate-400 dark:text-slate-500 uppercase">{t('incident.updated') || 'ACTUALIZADO'}:</span> 
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedIncident.details.lastUpdate}</span>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('app.severity') || 'SEVERIDAD'}:</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  {
                    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }[selectedIncident.severity]
                }`}>{selectedIncident.severity}</span>
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
