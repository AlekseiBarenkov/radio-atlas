import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';

type RadioBrowserLanguage = {
  name: string;
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

const normalizeLanguageSuggestion = (language: RadioBrowserLanguage): StationLanguageSuggestion | null => {
  const normalizedName = language.name.trim();

  if (normalizedName.length === 0) {
    return null;
  }

  return {
    name: normalizedName,
    stationCount: language.stationcount,
  };
};

const includesQuery = (value: string, query: string): boolean => {
  return value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
};

export const searchStationLanguages = async (
  params: SearchStationLanguagesParams,
  signal?: AbortSignal,
): Promise<StationLanguageSuggestion[]> => {
  const normalizedQuery = params.query.trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const languages = await request<RadioBrowserLanguage[]>(`${RADIO_BROWSER_API_BASE_URL}/languages`, {
    signal,
  });

  return languages
    .map(normalizeLanguageSuggestion)
    .filter((language): language is StationLanguageSuggestion => language !== null)
    .filter((language) => includesQuery(language.name, normalizedQuery))
    .sort((left, right) => {
      if (left.name.length !== right.name.length) {
        return left.name.length - right.name.length;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, params.limit ?? DEFAULT_LIMIT);
};
