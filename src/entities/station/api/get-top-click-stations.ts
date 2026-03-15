import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { GetTopClickStationsParams, RadioStation } from '../model/types';

const DEFAULT_LIMIT = 24;

export const getTopClickStations = async (
  params: GetTopClickStationsParams = {},
  signal?: AbortSignal,
): Promise<RadioStation[]> => {
  const { limit = DEFAULT_LIMIT, hideBroken = true } = params;

  const searchParams = new URLSearchParams({
    limit: String(limit),
    hidebroken: hideBroken ? 'true' : 'false',
  });

  return request<RadioStation[]>(`${RADIO_BROWSER_API_BASE_URL}/stations/topclick?${searchParams.toString()}`, {
    signal,
  });
};
