import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';

type RadioBrowserTag = {
  name: string;
  stationcount: number;
};

export type SearchStationTagsParams = {
  query: string;
  limit?: number;
};

export type StationTagSuggestion = {
  name: string;
  stationCount: number;
};

const DEFAULT_LIMIT = 12;

export const searchStationTags = async (
  params: SearchStationTagsParams,
  signal?: AbortSignal,
): Promise<StationTagSuggestion[]> => {
  const normalizedQuery = params.query.trim();

  const endpoint = normalizedQuery.length > 0 ? `/tags/${encodeURIComponent(normalizedQuery)}` : '/tags';

  const searchParams = new URLSearchParams({
    order: 'stationcount',
    reverse: 'true',
    hidebroken: 'true',
    limit: String(params.limit ?? DEFAULT_LIMIT),
  });

  const tags = await request<RadioBrowserTag[]>(`${RADIO_BROWSER_API_BASE_URL}${endpoint}?${searchParams.toString()}`, {
    signal,
  });

  return tags
    .map((tag) => ({
      name: tag.name.trim(),
      stationCount: tag.stationcount,
    }))
    .filter((tag) => tag.name.length > 0);
};
