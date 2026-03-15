import { useQuery } from '@tanstack/react-query';
import { getTopClickStations } from '../api/get-top-click-stations';
import type { GetTopClickStationsParams, RadioStation } from './types';

type UseTopClickStationsResult = {
  stations: RadioStation[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export const useTopClickStations = (params: GetTopClickStationsParams = {}): UseTopClickStationsResult => {
  const query = useQuery<RadioStation[], Error>({
    queryKey: ['stations', 'top-click', params.limit ?? 24, params.hideBroken ?? true],
    queryFn: ({ signal }) => getTopClickStations(params, signal),
  });

  return {
    stations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  };
};
