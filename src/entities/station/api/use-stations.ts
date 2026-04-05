import { useQuery } from '@tanstack/react-query';
import { getStations, type GetStationsParams } from './get-stations';
import type { RadioStation } from '../model/types';

const getStationsQueryKey = (params: GetStationsParams) => {
  return ['stations', params.limit ?? null, params.offset ?? null, params.hideBroken ?? true] as const;
};

export const useStations = (params: GetStationsParams = {}) => {
  return useQuery<RadioStation[]>({
    queryKey: getStationsQueryKey(params),
    queryFn: ({ signal }) => getStations(params, signal),
  });
};
