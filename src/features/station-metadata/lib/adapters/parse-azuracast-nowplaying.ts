import type {
  StationMetadataAdapterInput,
  StationMetadataResult,
  StationNowPlayingTiming,
  StationTrackHistoryItem,
} from '../../model/types';
import { parseStationMetadataTitle } from './parse-station-metadata-title';

type AzuraCastSong = {
  text?: unknown;
  artist?: unknown;
  title?: unknown;
};

type AzuraCastSongEvent = {
  played_at?: unknown;
  song?: AzuraCastSong;
  duration?: unknown;
  elapsed?: unknown;
  remaining?: unknown;
};

type AzuraCastNowPlaying = {
  now_playing?: AzuraCastSongEvent;
  playing_next?: AzuraCastSongEvent;
  song_history?: AzuraCastSongEvent[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getString = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

const getTimestamp = (value: unknown): string | null => {
  return typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null;
};

const getSeconds = (value: unknown): number | null => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
};

const getMilliseconds = (seconds: number | null): number | null => {
  return seconds === null ? null : seconds * 1000;
};

const getRemainingMsFromTimestamp = (value: unknown): number | null => {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(value * 1000 - Date.now(), 0) : null;
};

const getNowPlayingTiming = (
  event: AzuraCastSongEvent,
  nextEvent: AzuraCastSongEvent | undefined,
): StationNowPlayingTiming | null => {
  const duration = getSeconds(event.duration);
  const elapsed = getSeconds(event.elapsed);
  const explicitRemaining = getSeconds(event.remaining);
  const nextRemainingMs = getRemainingMsFromTimestamp(nextEvent?.played_at);
  const calculatedRemaining = duration !== null && elapsed !== null ? Math.max(duration - elapsed, 0) : null;
  const remainingMs = getMilliseconds(explicitRemaining) ?? nextRemainingMs ?? getMilliseconds(calculatedRemaining);
  const nextStartedAt = getTimestamp(nextEvent?.played_at);

  if (duration === null && elapsed === null && remainingMs === null && nextStartedAt === null) {
    return null;
  }

  return {
    durationMs: getMilliseconds(duration),
    elapsedMs: getMilliseconds(elapsed),
    remainingMs,
    nextStartedAt,
  };
};

const parseJson = (body: string): AzuraCastNowPlaying | null => {
  try {
    const parsed = JSON.parse(body);

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const getSongRawTitle = (song: AzuraCastSong | undefined): string | null => {
  if (!song) {
    return null;
  }

  const artist = getString(song.artist);
  const title = getString(song.title);

  if (artist && title) {
    return `${artist} - ${title}`;
  }

  return getString(song.text) ?? title;
};

const parseHistory = (events: AzuraCastSongEvent[] | undefined): StationTrackHistoryItem[] => {
  if (!events) {
    return [];
  }

  return events
    .map((event): StationTrackHistoryItem | null => {
      const rawTitle = getSongRawTitle(event.song);

      if (!rawTitle) {
        return null;
      }

      return {
        title: rawTitle,
        playedAt: getTimestamp(event.played_at),
      };
    })
    .filter((item): item is StationTrackHistoryItem => item !== null);
};

export const parseAzuraCastNowPlaying = (input: StationMetadataAdapterInput): StationMetadataResult | null => {
  const json = parseJson(input.body);

  if (!json?.now_playing?.song) {
    return null;
  }

  const rawTitle = getSongRawTitle(json.now_playing.song);
  const parsedTitle = rawTitle ? parseStationMetadataTitle(rawTitle) : null;

  return {
    source: 'azuracast-nowplaying',
    nowPlaying: parsedTitle
      ? {
          artist: parsedTitle.artist,
          title: parsedTitle.title,
          rawTitle: parsedTitle.rawTitle,
          updatedAt: getTimestamp(json.now_playing.played_at),
          timing: getNowPlayingTiming(json.now_playing, json.playing_next),
        }
      : null,
    history: parseHistory(json.song_history),
  };
};
