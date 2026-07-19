import { useQuery } from '@tanstack/react-query';
import type { Incident } from '../types';
import { fetchBackendIncidents } from '../api';

// Dummy data for incidents
const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    title: 'Incendio Estructural',
    description: 'Fuego en edificio residencial en Av. Alameda con Ahumada. Se reporta humo denso visible desde varios kilómetros.',
    type: 'fire',
    severity: 'critical',
    coordinates: [-70.6500, -33.4439],
    radius: 300, // 300 metros de afectación
    timestamp: new Date().toISOString(),
    details: {
      status: 'En curso',
      reportedBy: 'Bomberos CBS (Cuerpo de Bomberos de Santiago)',
      unitsDispatched: 8,
      affectedArea: 'Edificio patrimonial de 5 pisos',
      lastUpdate: 'Hace 5 min'
    }
  },
  {
    id: '2',
    title: 'Accidente de Tránsito',
    description: 'Colisión múltiple involucrando 3 vehículos particulares y 1 bus de transporte público en Av. Vicuña Mackenna altura 1500.',
    type: 'accident',
    severity: 'high',
    coordinates: [-70.6277, -33.4529],
    radius: 100, // 100 metros (corte de calle)
    timestamp: new Date().toISOString(),
    details: {
      status: 'Controlado',
      reportedBy: 'Carabineros de Chile',
      unitsDispatched: 3,
      affectedArea: 'Pista central bloqueada al norte',
      lastUpdate: 'Hace 12 min'
    }
  },
  {
    id: '3',
    title: 'Corte de Suministro',
    description: 'Fallo en transformador causa corte de luz en sector Paseo Bulnes, afectando a más de 500 clientes comerciales y residenciales.',
    type: 'utility',
    severity: 'medium',
    coordinates: [-70.6534, -33.4526],
    radius: 800, // 800 metros de corte de luz
    timestamp: new Date().toISOString(),
    details: {
      status: 'En curso',
      reportedBy: 'Enel Distribución',
      unitsDispatched: 1,
      affectedArea: 'Cuadrante Tarapacá - Zenteno',
      lastUpdate: 'Hace 45 min'
    }
  },
  {
    id: '4',
    title: 'Inundación por Lluvias',
    description: 'Av. Providencia con Tobalaba completamente anegada por rebalse de alcantarillas tras fuertes precipitaciones.',
    type: 'rain',
    severity: 'high',
    coordinates: [-70.6015, -33.4182],
    radius: 400, // 400 metros anegados
    timestamp: new Date().toISOString(),
    details: {
      status: 'En curso',
      reportedBy: 'Seguridad Providencia',
      unitsDispatched: 2,
      affectedArea: 'Paso bajo nivel Sanhattan',
      lastUpdate: 'Hace 2 min'
    }
  },
  {
    id: '5',
    title: 'Lluvias Intensas y Marejadas',
    description: 'Sistema frontal en Av. Errázuriz causa anegamiento parcial y olas superando el rompeolas, precaución al conducir.',
    type: 'rain',
    severity: 'medium',
    coordinates: [-71.6231, -33.0456],
    radius: 1200, // 1.2km de borde costero
    timestamp: new Date().toISOString(),
    details: {
      status: 'En curso',
      reportedBy: 'Armada de Chile / ONEMI',
      unitsDispatched: 0,
      affectedArea: 'Borde costero sector puerto',
      lastUpdate: 'Hace 20 min'
    }
  }
];

const fetchLiveIncidents = async (): Promise<Incident[]> => {
  try {
    const data = await fetchBackendIncidents();
    
    // Combina los datos reales del backend con los mocks para que siempre haya variedad de incidentes
    // (incluyendo lluvias) en modo demostración.
    return data.length > 0 ? [...data, ...MOCK_INCIDENTS] : MOCK_INCIDENTS;
  } catch (error) {
    console.error('Connection error with backend, falling back to mock data:', error);
    return MOCK_INCIDENTS;
  }
};

import { useFilterStore } from '../store/useFilterStore';

export const useIncidents = () => {
  const { userReportedIncidents } = useFilterStore();
  
  const query = useQuery({
    queryKey: ['live_incidents'],
    queryFn: fetchLiveIncidents,
    refetchInterval: 60000, // Hacer polling cada 1 minuto automáticamente
  });

  return {
    ...query,
    data: [...(query.data || []), ...userReportedIncidents]
  };
};
