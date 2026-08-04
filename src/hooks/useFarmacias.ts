import { useQuery } from '@tanstack/react-query';
import { fetchFarmacias } from '../api';

export interface Farmacia {
  nombre: string;
  comuna: string;
  direccion: string;
  horaApertura: string;
  horaCierre: string;
  latitud: number;
  longitud: number;
  telefono: string;
}

const fetchFarmaciasData = async (): Promise<Farmacia[]> => {
  try {
    const data = await fetchFarmacias();
    return data;
  } catch (error) {
    console.error('Connection error with backend farmacias feed:', error);
    return [];
  }
};

export const useFarmacias = () => {
  const query = useQuery({
    queryKey: ['farmacias'],
    queryFn: fetchFarmaciasData,
    refetchInterval: 60000 * 60, // Cada 1 hora (no cambian rápido)
  });

  return {
    ...query,
    data: query.data || []
  };
};
