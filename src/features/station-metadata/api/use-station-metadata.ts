import { useQuery } from '@tanstack/react-query';
import type { RadioStation } from '@entities/station';
import { getStationMetadata } from './get-station-metadata';

const STATION_METADATA_REFETCH_INTERVAL_MS = 30_000;
const STATION_METADATA_NOT_FOUND_REFETCH_INTERVAL_MS = 5 * 60_000;
const STATION_METADATA_MIN_ADAPTIVE_REFETCH_INTERVAL_MS = 2_000;
const STATION_METADATA_ADAPTIVE_REFETCH_OFFSET_MS = 5_000;

type UseStationMetadataParams = {
  station: RadioStation | null;
};

const getStationMetadataRefetchInterval = (remainingMs: number | null | undefined): number => {
  if (remainingMs === null || remainingMs === undefined) {
    return STATION_METADATA_REFETCH_INTERVAL_MS;
  }

  return Math.max(
    STATION_METADATA_MIN_ADAPTIVE_REFETCH_INTERVAL_MS,
    remainingMs + STATION_METADATA_ADAPTIVE_REFETCH_OFFSET_MS,
  );
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
      if (query.state.data?.status === 'not-found') {
        return STATION_METADATA_NOT_FOUND_REFETCH_INTERVAL_MS;
      }

      return getStationMetadataRefetchInterval(query.state.data?.metadata?.nowPlaying?.timing?.remainingMs);
    },
    staleTime: STATION_METADATA_REFETCH_INTERVAL_MS,
  });
};
