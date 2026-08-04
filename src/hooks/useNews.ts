import { useQuery } from '@tanstack/react-query';
import { fetchNewsFeed } from '../api';
import type { Incident } from '../types';

const fetchNews = async (): Promise<Incident[]> => {
  try {
    const data = await fetchNewsFeed();
    return data;
  } catch (error) {
    console.error('Connection error with backend news feed:', error);
    return [];
  }
};

export const useNews = () => {
  const query = useQuery({
    queryKey: ['news_feed'],
    queryFn: fetchNews,
    refetchInterval: 60000, // Hacer polling cada 1 minuto automáticamente
  });

  return {
    ...query,
    data: query.data || []
  };
};
