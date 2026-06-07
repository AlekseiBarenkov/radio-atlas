import type { RadioStation } from '@entities/station';
import { isRadioStation } from '@entities/station/lib/is-radio-station';

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

    return parsedValue.filter(isRadioStation);
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
