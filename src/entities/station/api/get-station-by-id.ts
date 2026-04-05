import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { RadioStation } from '../model/types';

export const getStationById = async (stationId: string, signal?: AbortSignal): Promise<RadioStation | null> => {
  const normalizedStationId = stationId.trim();

  if (normalizedStationId.length === 0) {
    return null;
  }

  const stations = await request<RadioStation[]>(
    `${RADIO_BROWSER_API_BASE_URL}/stations/byuuid/${encodeURIComponent(normalizedStationId)}`,
    {
      signal,
    },
  );

  return stations[0] ?? null;
};
