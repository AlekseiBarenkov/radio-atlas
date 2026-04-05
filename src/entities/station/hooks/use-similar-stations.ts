import { useQuery } from '@tanstack/react-query';
import { getSimilarStations } from '@entities/station/api/get-similar-stations';
import type { RadioStation } from '@entities/station/model/types';

type UseSimilarStationsParams = {
  stationId: string;
  tags: string[];
  limit?: number;
};

const getSimilarStationsQueryKey = (params: UseSimilarStationsParams) => {
  return ['stations', 'similar', params.stationId, params.tags, params.limit ?? null] as const;
};

const getNormalizedTags = (tags: string[]): string[] => {
  return tags.map((tag) => tag.trim()).filter((tag, index, array) => tag.length > 0 && array.indexOf(tag) === index);
};

export const useSimilarStations = (params: UseSimilarStationsParams) => {
  const normalizedStationId = params.stationId.trim();
  const normalizedTags = getNormalizedTags(params.tags);

  return useQuery<RadioStation[]>({
    queryKey: getSimilarStationsQueryKey({
      stationId: normalizedStationId,
      tags: normalizedTags,
      limit: params.limit,
    }),
    queryFn: ({ signal }) =>
      getSimilarStations(
        {
          stationId: normalizedStationId,
          tags: normalizedTags,
          limit: params.limit,
        },
        signal,
      ),
    enabled: normalizedStationId.length > 0 && normalizedTags.length > 0,
  });
};
