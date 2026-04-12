import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';

type RadioBrowserCountry = {
  name: string;
  stationcount: number;
};

export type SearchStationCountriesParams = {
  query: string;
  limit?: number;
};

export type StationCountrySuggestion = {
  name: string;
  stationCount: number;
};

const DEFAULT_LIMIT = 12;

const normalizeCountrySuggestion = (country: RadioBrowserCountry): StationCountrySuggestion | null => {
  const normalizedName = country.name.trim();

  if (normalizedName.length === 0) {
    return null;
  }

  return {
    name: normalizedName,
    stationCount: country.stationcount,
  };
};

const includesQuery = (value: string, query: string): boolean => {
  return value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
};

export const searchStationCountries = async (
  params: SearchStationCountriesParams,
  signal?: AbortSignal,
): Promise<StationCountrySuggestion[]> => {
  const normalizedQuery = params.query.trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const countries = await request<RadioBrowserCountry[]>(`${RADIO_BROWSER_API_BASE_URL}/countries`, {
    signal,
  });

  return countries
    .map(normalizeCountrySuggestion)
    .filter((country): country is StationCountrySuggestion => country !== null)
    .filter((country) => includesQuery(country.name, normalizedQuery))
    .sort((left, right) => {
      if (left.name.length !== right.name.length) {
        return left.name.length - right.name.length;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, params.limit ?? DEFAULT_LIMIT);
};
