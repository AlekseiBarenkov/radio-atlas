const PLAYER_VOLUME_STORAGE_KEY = 'radio-atlas:player-volume';
const PLAYER_DEFAULT_VOLUME = 1;

export const normalizePlayerVolume = (value: number): number => {
  if (!Number.isFinite(value)) {
    return PLAYER_DEFAULT_VOLUME;
  }

  return Math.min(1, Math.max(0, value));
};

export const loadPlayerVolume = (): number => {
  if (typeof window === 'undefined') {
    return PLAYER_DEFAULT_VOLUME;
  }

  const value = window.localStorage.getItem(PLAYER_VOLUME_STORAGE_KEY);

  if (value === null) {
    return PLAYER_DEFAULT_VOLUME;
  }

  return normalizePlayerVolume(Number(value));
};

export const savePlayerVolume = (volume: number) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PLAYER_VOLUME_STORAGE_KEY, String(normalizePlayerVolume(volume)));
};
