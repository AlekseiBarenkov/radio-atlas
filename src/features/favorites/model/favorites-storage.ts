import type { RadioStation } from '@entities/station';

const FAVORITES_STORAGE_KEY = 'radio-atlas:favorites';

export const loadFavoriteStations = (): RadioStation[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((item): item is RadioStation => {
      if (typeof item !== 'object' || item === null) {
        return false;
      }

      const candidate = item as Record<string, unknown>;

      return (
        typeof candidate.changeuuid === 'string' &&
        typeof candidate.stationuuid === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.url === 'string' &&
        typeof candidate.url_resolved === 'string' &&
        typeof candidate.homepage === 'string' &&
        typeof candidate.favicon === 'string' &&
        typeof candidate.tags === 'string' &&
        typeof candidate.country === 'string' &&
        typeof candidate.countrycode === 'string' &&
        typeof candidate.state === 'string' &&
        typeof candidate.language === 'string' &&
        typeof candidate.languagecodes === 'string' &&
        typeof candidate.votes === 'number' &&
        typeof candidate.codec === 'string' &&
        typeof candidate.bitrate === 'number' &&
        typeof candidate.clickcount === 'number' &&
        typeof candidate.hls === 'number' &&
        typeof candidate.lastcheckok === 'number'
      );
    });
  } catch {
    return [];
  }
};

export const saveFavoriteStations = (stations: RadioStation[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(stations));
};
