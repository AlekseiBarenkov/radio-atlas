import type { StationMetadataAdapterInput, StationMetadataResult, StationTrackHistoryItem } from '../../model/types';
import { parseStationMetadataTitle } from './parse-station-metadata-title';

type IcecastStatusJson = {
  icestats?: {
    source?: IcecastSource | IcecastSource[];
  };
};

type IcecastSource = {
  artist?: unknown;
  title?: unknown;
  'display-title'?: unknown;
  yp_currently_playing?: unknown;
  listenurl?: unknown;
  metadata_updated?: unknown;
  playlist?: {
    trackList?: Array<{
      title?: unknown;
    }>;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getString = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

const parseJson = (body: string): IcecastStatusJson | null => {
  try {
    const parsed = JSON.parse(body);

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const getSources = (json: IcecastStatusJson): IcecastSource[] => {
  const source = json.icestats?.source;

  if (!source) {
    return [];
  }

  return Array.isArray(source) ? source : [source];
};

const getStreamPath = (url: string): string | null => {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
};

const selectSource = (sources: IcecastSource[], streamUrl: string): IcecastSource | null => {
  if (sources.length === 0) {
    return null;
  }

  const streamPath = getStreamPath(streamUrl);

  if (streamPath) {
    const pathMatch = sources.find((source) => {
      const listenUrl = getString(source.listenurl);

      if (!listenUrl) {
        return false;
      }

      return getStreamPath(listenUrl) === streamPath;
    });

    if (pathMatch) {
      return pathMatch;
    }
  }

  return sources[0] ?? null;
};

const getCurrentTitle = (source: IcecastSource): string | null => {
  const artist = getString(source.artist);
  const title = getString(source.title);

  if (artist && title) {
    return `${artist} - ${title}`;
  }

  return getString(source['display-title']) ?? getString(source.yp_currently_playing) ?? title;
};

const getHistory = (source: IcecastSource): StationTrackHistoryItem[] => {
  const trackList = source.playlist?.trackList;

  if (!trackList) {
    return [];
  }

  return trackList
    .map((track) => getString(track.title))
    .filter((title): title is string => title !== null)
    .map((title) => ({
      title,
      playedAt: null,
    }));
};

export const parseIcecastStatusJson = (input: StationMetadataAdapterInput): StationMetadataResult | null => {
  const json = parseJson(input.body);

  if (!json) {
    return null;
  }

  const source = selectSource(getSources(json), input.streamUrl);

  if (!source) {
    return null;
  }

  const rawCurrentTitle = getCurrentTitle(source);
  const parsedTitle = rawCurrentTitle ? parseStationMetadataTitle(rawCurrentTitle) : null;

  return {
    source: 'icecast-status-json',
    nowPlaying: parsedTitle
      ? {
          artist: parsedTitle.artist,
          title: parsedTitle.title,
          rawTitle: parsedTitle.rawTitle,
          updatedAt: getString(source.metadata_updated),
          timing: null,
        }
      : null,
    history: getHistory(source),
  };
};
