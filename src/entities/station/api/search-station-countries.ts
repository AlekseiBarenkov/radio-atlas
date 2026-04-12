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

let countriesCache: StationCountrySuggestion[] | null = null;
let countriesRequestPromise: Promise<StationCountrySuggestion[]> | null = null;

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

const loadCountries = async (signal?: AbortSignal): Promise<StationCountrySuggestion[]> => {
  if (countriesCache !== null) {
    return countriesCache;
  }

  if (countriesRequestPromise !== null) {
    return countriesRequestPromise;
  }

  const searchParams = new URLSearchParams({
    order: 'stationcount',
    reverse: 'true',
    hidebroken: 'true',
  });

  countriesRequestPromise = request<RadioBrowserCountry[]>(
    `${RADIO_BROWSER_API_BASE_URL}/countries?${searchParams.toString()}`,
    {
      signal,
    },
  )
    .then((countries) => {
      const normalizedCountries = countries
        .map(normalizeCountrySuggestion)
        .filter((country): country is StationCountrySuggestion => country !== null);

      countriesCache = normalizedCountries;

      return normalizedCountries;
    })
    .finally(() => {
      countriesRequestPromise = null;
    });

  return countriesRequestPromise;
};

export const searchStationCountries = async (
  params: SearchStationCountriesParams,
  signal?: AbortSignal,
): Promise<StationCountrySuggestion[]> => {
  const normalizedQuery = params.query.trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const countries = await loadCountries(signal);

  return countries
    .filter((country) => includesQuery(country.name, normalizedQuery))
    .slice(0, params.limit ?? DEFAULT_LIMIT);
};
