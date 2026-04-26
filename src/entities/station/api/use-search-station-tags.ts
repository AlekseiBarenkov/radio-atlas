import { useQuery } from '@tanstack/react-query';
import { searchStationTags, type SearchStationTagsParams } from './search-station-tags';

type UseSearchStationTagsParams = SearchStationTagsParams & {
  enabled?: boolean;
};

const getSearchStationTagsQueryKey = (params: SearchStationTagsParams) => {
  return ['station-tags', 'search', params.query, params.limit ?? null] as const;
};

export const useSearchStationTags = (params: UseSearchStationTagsParams) => {
  const { enabled = true, ...searchParams } = params;
  const normalizedQuery = searchParams.query.trim();

  return useQuery({
    queryKey: getSearchStationTagsQueryKey({
      ...searchParams,
      query: normalizedQuery,
    }),
    queryFn: ({ signal }) =>
      searchStationTags(
        {
          ...searchParams,
          query: normalizedQuery,
        },
        signal,
      ),
    enabled,
  });
};
