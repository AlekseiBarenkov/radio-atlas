import { useQuery } from '@tanstack/react-query';
import type { RadioStation } from '@entities/station';
import { getStationMetadata } from './get-station-metadata';

const STATION_METADATA_REFETCH_INTERVAL_MS = 30_000;
const STATION_METADATA_NOT_FOUND_REFETCH_INTERVAL_MS = 5 * 60_000;

type UseStationMetadataParams = {
  station: RadioStation | null;
};

export const useStationMetadata = (params: UseStationMetadataParams) => {
  const stationId = params.station?.stationuuid.trim() ?? '';

  return useQuery({
    queryKey: ['station-metadata', stationId],
    queryFn: () => {
      if (!params.station) {
        return {
          status: 'not-found' as const,
          metadata: null,
        };
      }

      return getStationMetadata(params.station);
    },
    enabled: Boolean(params.station) && stationId.length > 0,
    refetchInterval: (query) => {
      return query.state.data?.status === 'not-found'
        ? STATION_METADATA_NOT_FOUND_REFETCH_INTERVAL_MS
        : STATION_METADATA_REFETCH_INTERVAL_MS;
    },
    staleTime: STATION_METADATA_REFETCH_INTERVAL_MS,
  });
};
