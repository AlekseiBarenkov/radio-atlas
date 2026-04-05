import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { RadioStation } from '../model/types';

export type SearchStationsParams = {
  name: string;
  limit?: number;
  hideBroken?: boolean;
};

const DEFAULT_LIMIT = 48;

export const searchStations = async (params: SearchStationsParams, signal?: AbortSignal): Promise<RadioStation[]> => {
  const { name, limit = DEFAULT_LIMIT, hideBroken = true } = params;

  const searchParams = new URLSearchParams({
    name,
    limit: String(limit),
    hidebroken: hideBroken ? 'true' : 'false',
  });

  return request<RadioStation[]>(`${RADIO_BROWSER_API_BASE_URL}/stations/search?${searchParams.toString()}`, {
    signal,
  });
};
