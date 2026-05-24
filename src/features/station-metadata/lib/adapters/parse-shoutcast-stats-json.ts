import type { StationMetadataAdapterInput, StationMetadataResult } from '../../model/types';
import { parseStationMetadataTitle } from './parse-station-metadata-title';

type ShoutcastStatsJson = {
  songtitle?: unknown;
  streamstatus?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getString = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

const parseJson = (body: string): ShoutcastStatsJson | null => {
  try {
    const parsed = JSON.parse(body);

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const isShoutcastStatsJson = (json: ShoutcastStatsJson): boolean => {
  return 'songtitle' in json || 'streamstatus' in json;
};

export const parseShoutcastStatsJson = (input: StationMetadataAdapterInput): StationMetadataResult | null => {
  const json = parseJson(input.body);

  if (!json || !isShoutcastStatsJson(json)) {
    return null;
  }

  const rawTitle = getString(json.songtitle);
  const parsedTitle = rawTitle ? parseStationMetadataTitle(rawTitle) : null;

  return {
    source: 'shoutcast-stats-json',
    nowPlaying: parsedTitle
      ? {
          artist: parsedTitle.artist,
          title: parsedTitle.title,
          rawTitle: parsedTitle.rawTitle,
          updatedAt: null,
        }
      : null,
    history: [],
  };
};
