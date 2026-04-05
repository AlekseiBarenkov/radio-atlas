import type { RadioStation } from '../model/types';

type GetSimilarStationsQueryKeyParams = {
  station: RadioStation;
  limit?: number;
};

export const getSimilarStationsQueryKey = (params: GetSimilarStationsQueryKeyParams) => {
  const { station, limit } = params;

  return [
    'stations',
    'similar',
    station.stationuuid,
    station.tags,
    station.country,
    station.state,
    station.language,
    limit ?? null,
  ] as const;
};
