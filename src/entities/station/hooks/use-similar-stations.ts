import { useQuery } from '@tanstack/react-query';
import { getSimilarStations } from '@entities/station/api/get-similar-stations';
import type { RadioStation } from '@entities/station/model/types';

type UseSimilarStationsParams = {
  station: RadioStation;
  limit?: number;
};

const getSimilarStationsQueryKey = (params: UseSimilarStationsParams) => {
  return [
    'stations',
    'similar',
    params.station.stationuuid,
    params.station.tags,
    params.station.country,
    params.station.state,
    params.station.language,
    params.limit ?? null,
  ] as const;
};

export const useSimilarStations = (params: UseSimilarStationsParams) => {
  const normalizedStationId = params.station.stationuuid.trim();

  return useQuery<RadioStation[]>({
    queryKey: getSimilarStationsQueryKey(params),
    queryFn: ({ signal }) =>
      getSimilarStations(
        {
          station: params.station,
          limit: params.limit,
        },
        signal,
      ),
    enabled: normalizedStationId.length > 0,
  });
};
