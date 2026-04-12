import { useQuery } from '@tanstack/react-query';
import { searchStationLanguages, type SearchStationLanguagesParams } from './search-station-languages';

const getSearchStationLanguagesQueryKey = (params: SearchStationLanguagesParams) => {
  return ['station-languages', 'search', params.query, params.limit ?? null] as const;
};

export const useSearchStationLanguages = (params: SearchStationLanguagesParams) => {
  const normalizedQuery = params.query.trim();

  return useQuery({
    queryKey: getSearchStationLanguagesQueryKey({
      ...params,
      query: normalizedQuery,
    }),
    queryFn: ({ signal }) =>
      searchStationLanguages(
        {
          ...params,
          query: normalizedQuery,
        },
        signal,
      ),
    enabled: normalizedQuery.length > 0,
  });
};
