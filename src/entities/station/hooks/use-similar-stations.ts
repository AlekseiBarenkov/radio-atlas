import { useQuery } from '@tanstack/react-query';
import { getSimilarStations } from '@entities/station/api/get-similar-stations';
import { getSimilarStationsQueryKey } from '@entities/station/api/get-similar-stations-query-key';
import type { RadioStation } from '@entities/station/model/types';

type UseSimilarStationsParams = {
  station: RadioStation;
  limit?: number;
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
