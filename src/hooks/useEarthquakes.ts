import { useQuery } from '@tanstack/react-query';
import { fetchUSGSEarthquakes } from '../api';

export interface Earthquake {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    title: string;
  };
  geometry: {
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
}

export const useEarthquakes = () => {
  return useQuery({
    queryKey: ['earthquakes'],
    queryFn: async (): Promise<Earthquake[]> => {
      const data = await fetchUSGSEarthquakes();
      
      // Filter only earthquakes that contain 'Chile' in the place string to be absolutely strict
      const chileEarthquakes = data.features.filter((feature: Earthquake) => {
        const place = feature.properties.place?.toLowerCase() || '';
        return place.includes('chile');
      });

      return chileEarthquakes;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
