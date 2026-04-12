import { useQuery } from '@tanstack/react-query';
import { getStations, type GetStationsParams } from './get-stations';
import type { RadioStation } from '../model/types';

const getStationsQueryKey = (params: GetStationsParams) => {
  return [
    'stations',
    params.limit ?? null,
    params.offset ?? null,
    params.hideBroken ?? true,
    params.country ?? '',
    params.language ?? '',
  ] as const;
};

export const useStations = (params: GetStationsParams = {}) => {
  const normalizedCountry = params.country?.trim() ?? '';
  const normalizedLanguage = params.language?.trim() ?? '';

  return useQuery<RadioStation[]>({
    queryKey: getStationsQueryKey({
      ...params,
      country: normalizedCountry,
      language: normalizedLanguage,
    }),
    queryFn: ({ signal }) =>
      getStations(
        {
          ...params,
          country: normalizedCountry,
          language: normalizedLanguage,
        },
        signal,
      ),
  });
};
