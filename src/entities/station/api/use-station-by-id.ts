import { useQuery } from '@tanstack/react-query';
import type { RadioStation } from '../model/types';
import { getStationById } from './get-station-by-id';

const getStationByIdQueryKey = (stationId: string) => {
  return ['stations', 'by-id', stationId] as const;
};

export const useStationById = (stationId: string) => {
  const normalizedStationId = stationId.trim();

  return useQuery<RadioStation | null>({
    queryKey: getStationByIdQueryKey(normalizedStationId),
    queryFn: ({ signal }) => getStationById(normalizedStationId, signal),
    enabled: normalizedStationId.length > 0,
  });
};
