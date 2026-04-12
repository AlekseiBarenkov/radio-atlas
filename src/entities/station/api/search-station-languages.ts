import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';

type RadioBrowserLanguage = {
  name: string;
  iso_639: string | null;
  stationcount: number;
};

export type SearchStationLanguagesParams = {
  query: string;
  limit?: number;
};

export type StationLanguageSuggestion = {
  name: string;
  stationCount: number;
};

const DEFAULT_LIMIT = 12;

export const searchStationLanguages = async (
  params: SearchStationLanguagesParams,
  signal?: AbortSignal,
): Promise<StationLanguageSuggestion[]> => {
  const normalizedQuery = params.query.trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const searchParams = new URLSearchParams({
    order: 'name',
    reverse: 'false',
    hidebroken: 'true',
    limit: String(params.limit ?? DEFAULT_LIMIT),
  });

  const languages = await request<RadioBrowserLanguage[]>(
    `${RADIO_BROWSER_API_BASE_URL}/languages/${encodeURIComponent(normalizedQuery)}?${searchParams.toString()}`,
    {
      signal,
    },
  );

  return languages
    .map((language) => ({
      name: language.name.trim(),
      stationCount: language.stationcount,
    }))
    .filter((language) => language.name.length > 0);
};
