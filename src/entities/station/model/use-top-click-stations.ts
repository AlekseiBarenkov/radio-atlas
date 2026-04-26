import { useQuery } from '@tanstack/react-query';
import { getTopClickStations } from '../api/get-top-click-stations';
import type { GetTopClickStationsParams, RadioStation } from './types';

type UseTopClickStationsResult = {
  stations: RadioStation[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const TOP_CLICK_STATIONS_STALE_TIME = 1000 * 60 * 30;
const TOP_CLICK_STATIONS_GC_TIME = 1000 * 60 * 60;

export const useTopClickStations = (params: GetTopClickStationsParams = {}): UseTopClickStationsResult => {
  const query = useQuery<RadioStation[], Error>({
    queryKey: ['stations', 'top-click', params.limit ?? 24, params.hideBroken ?? true],
    queryFn: ({ signal }) => getTopClickStations(params, signal),
    staleTime: TOP_CLICK_STATIONS_STALE_TIME,
    gcTime: TOP_CLICK_STATIONS_GC_TIME,
  });

  return {
    stations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  };
};
