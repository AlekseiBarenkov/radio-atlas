import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { RadioStation } from '../model/types';

export type GetStationsParams = {
  limit?: number;
  offset?: number;
  hideBroken?: boolean;
};

const DEFAULT_LIMIT = 48;
const DEFAULT_OFFSET = 0;

export const getStations = async (params: GetStationsParams = {}, signal?: AbortSignal): Promise<RadioStation[]> => {
  const { limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET, hideBroken = true } = params;

  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    hidebroken: hideBroken ? 'true' : 'false',
  });

  return request<RadioStation[]>(`${RADIO_BROWSER_API_BASE_URL}/stations?${searchParams.toString()}`, {
    signal,
  });
};
