import { useQuery } from '@tanstack/react-query';
import type { Incident } from '../types';
import { fetchBackendIncidents } from '../api';

const fetchLiveIncidents = async (): Promise<Incident[]> => {
  try {
    const data = await fetchBackendIncidents();
    return data;
  } catch (error) {
    console.error('Connection error with backend:', error);
    return [];
  }
};

export const useIncidents = () => {
  const query = useQuery({
    queryKey: ['live_incidents'],
    queryFn: fetchLiveIncidents,
    refetchInterval: 60000, // Hacer polling cada 1 minuto automáticamente
  });

  return {
    ...query,
    data: query.data || []
  };
};
