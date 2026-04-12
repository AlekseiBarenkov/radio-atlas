import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { RadioStation } from '../model/types';

export type SearchStationsParams = {
  name: string;
  country?: string;
  language?: string;
  limit?: number;
  hideBroken?: boolean;
};

const DEFAULT_LIMIT = 48;

export const searchStations = async (params: SearchStationsParams, signal?: AbortSignal): Promise<RadioStation[]> => {
  const { name, country, language, limit = DEFAULT_LIMIT, hideBroken = true } = params;

  const searchParams = new URLSearchParams({
    name,
    limit: String(limit),
    hidebroken: hideBroken ? 'true' : 'false',
  });

  const normalizedCountry = country?.trim() ?? '';
  const normalizedLanguage = language?.trim() ?? '';

  if (normalizedCountry.length > 0) {
    searchParams.set('country', normalizedCountry);
    searchParams.set('countryExact', 'true');
  }

  if (normalizedLanguage.length > 0) {
    searchParams.set('language', normalizedLanguage);
    searchParams.set('languageExact', 'true');
  }

  return request<RadioStation[]>(`${RADIO_BROWSER_API_BASE_URL}/stations/search?${searchParams.toString()}`, {
    signal,
  });
};
