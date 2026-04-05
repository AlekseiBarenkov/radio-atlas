import type { PlayerHistoryStation } from './types';

const PLAYER_HISTORY_STORAGE_KEY = 'radio-atlas:player-history';
const PLAYER_HISTORY_LIMIT = 12;

const isPlayerHistoryStation = (value: unknown): value is PlayerHistoryStation => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

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
};

export const getPlayerHistoryLimit = (): number => {
  return PLAYER_HISTORY_LIMIT;
};

export const loadPlayerHistoryStations = (): PlayerHistoryStation[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(PLAYER_HISTORY_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isPlayerHistoryStation).slice(0, PLAYER_HISTORY_LIMIT);
  } catch {
    return [];
  }
};

export const savePlayerHistoryStations = (stations: PlayerHistoryStation[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PLAYER_HISTORY_STORAGE_KEY, JSON.stringify(stations.slice(0, PLAYER_HISTORY_LIMIT)));
};
