import { useQuery } from '@tanstack/react-query';
import { searchStations, type SearchStationsParams } from './search-stations';
import type { RadioStation } from '../model/types';

const getSearchStationsQueryKey = (params: SearchStationsParams) => {
  return [
    'stations',
    'search',
    params.name,
    params.country ?? '',
    params.language ?? '',
    params.limit ?? null,
    params.hideBroken ?? true,
  ] as const;
};

export const useSearchStations = (params: SearchStationsParams) => {
  const normalizedName = params.name.trim();
  const normalizedCountry = params.country?.trim() ?? '';
  const normalizedLanguage = params.language?.trim() ?? '';

  return useQuery<RadioStation[]>({
    queryKey: getSearchStationsQueryKey({
      ...params,
      name: normalizedName,
      country: normalizedCountry,
      language: normalizedLanguage,
    }),
    queryFn: ({ signal }) =>
      searchStations(
        {
          ...params,
          name: normalizedName,
          country: normalizedCountry,
          language: normalizedLanguage,
        },
        signal,
      ),
    enabled: normalizedName.length > 0,
  });
};
