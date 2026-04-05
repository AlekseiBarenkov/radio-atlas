import { useQuery } from '@tanstack/react-query';
import { searchStations, type SearchStationsParams } from './search-stations';
import type { RadioStation } from '../model/types';

const getSearchStationsQueryKey = (params: SearchStationsParams) => {
  return ['stations', 'search', params.name, params.limit ?? null, params.hideBroken ?? true] as const;
};

export const useSearchStations = (params: SearchStationsParams) => {
  const normalizedName = params.name.trim();

  return useQuery<RadioStation[]>({
    queryKey: getSearchStationsQueryKey({
      ...params,
      name: normalizedName,
    }),
    queryFn: ({ signal }) =>
      searchStations(
        {
          ...params,
          name: normalizedName,
        },
        signal,
      ),
    enabled: normalizedName.length > 0,
  });
};
