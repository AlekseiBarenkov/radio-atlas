import { useQuery } from '@tanstack/react-query';
import { searchStationCountries, type SearchStationCountriesParams } from './search-station-countries';

const getSearchStationCountriesQueryKey = (params: SearchStationCountriesParams) => {
  return ['station-countries', 'search', params.query, params.limit ?? null] as const;
};

export const useSearchStationCountries = (params: SearchStationCountriesParams) => {
  const normalizedQuery = params.query.trim();

  return useQuery({
    queryKey: getSearchStationCountriesQueryKey({
      ...params,
      query: normalizedQuery,
    }),
    queryFn: ({ signal }) =>
      searchStationCountries(
        {
          ...params,
          query: normalizedQuery,
        },
        signal,
      ),
    enabled: normalizedQuery.length > 0,
  });
};
