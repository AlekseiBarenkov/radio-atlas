import { isRadioStation } from '@entities/station/lib/is-radio-station';
import type { RadioStation } from '@entities/station/model/types';

const PLAYER_SESSION_STORAGE_KEY = 'radio-atlas:player-session';

export const loadPlayerSessionStation = (): RadioStation | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(PLAYER_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    return isRadioStation(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
};

export const savePlayerSessionStation = (station: RadioStation) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PLAYER_SESSION_STORAGE_KEY, JSON.stringify(station));
};

export const clearPlayerSessionStation = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PLAYER_SESSION_STORAGE_KEY);
};
