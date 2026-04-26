import { useQuery } from '@tanstack/react-query';
import { searchStationTags, type SearchStationTagsParams } from './search-station-tags';

const getSearchStationTagsQueryKey = (params: SearchStationTagsParams) => {
  return ['station-tags', 'search', params.query, params.limit ?? null] as const;
};

export const useSearchStationTags = (params: SearchStationTagsParams) => {
  const normalizedQuery = params.query.trim();

  return useQuery({
    queryKey: getSearchStationTagsQueryKey({
      ...params,
      query: normalizedQuery,
    }),
    queryFn: ({ signal }) =>
      searchStationTags(
        {
          ...params,
          query: normalizedQuery,
        },
        signal,
      ),
    enabled: normalizedQuery.length > 0,
  });
};
