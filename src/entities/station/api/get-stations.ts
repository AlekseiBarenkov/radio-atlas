import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { RadioStation } from '../model/types';

export type GetStationsParams = {
  name?: string;
  limit?: number;
  offset?: number;
  hideBroken?: boolean;
  country?: string;
  language?: string;
};

const DEFAULT_LIMIT = 48;
const DEFAULT_OFFSET = 0;

export const getStations = async (params: GetStationsParams = {}, signal?: AbortSignal): Promise<RadioStation[]> => {
  const { name, limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET, hideBroken = true, country, language } = params;

  const searchParams = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
    hidebroken: String(hideBroken),
  });

  const normalizedName = name?.trim() ?? '';
  const normalizedCountry = country?.trim() ?? '';
  const normalizedLanguage = language?.trim() ?? '';

  if (normalizedName.length > 0) {
    searchParams.set('name', normalizedName);
  }

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
