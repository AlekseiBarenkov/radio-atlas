import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { RadioStation } from '../model/types';

type GetSimilarStationsParams = {
  stationId: string;
  tags: string[];
  limit?: number;
};

const DEFAULT_LIMIT = 6;
const MAX_TAGS_TO_FETCH = 3;

const getNormalizedTags = (tags: string[]): string[] => {
  return tags.map((tag) => tag.trim()).filter((tag, index, array) => tag.length > 0 && array.indexOf(tag) === index);
};

const getStationsByTag = async (tag: string, limit: number, signal?: AbortSignal): Promise<RadioStation[]> => {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    hidebroken: 'true',
  });

  return request<RadioStation[]>(
    `${RADIO_BROWSER_API_BASE_URL}/stations/bytag/${encodeURIComponent(tag)}?${searchParams.toString()}`,
    {
      signal,
    },
  );
};

export const getSimilarStations = async (
  params: GetSimilarStationsParams,
  signal?: AbortSignal,
): Promise<RadioStation[]> => {
  const { stationId, limit = DEFAULT_LIMIT } = params;
  const normalizedStationId = stationId.trim();
  const normalizedTags = getNormalizedTags(params.tags).slice(0, MAX_TAGS_TO_FETCH);

  if (normalizedStationId.length === 0 || normalizedTags.length === 0) {
    return [];
  }

  const stationMap = new Map<string, RadioStation>();

  for (const tag of normalizedTags) {
    const stations = await getStationsByTag(tag, limit + 1, signal);

    stations.forEach((station) => {
      if (station.stationuuid === normalizedStationId) {
        return;
      }

      if (stationMap.has(station.stationuuid)) {
        return;
      }

      stationMap.set(station.stationuuid, station);
    });

    if (stationMap.size >= limit) {
      break;
    }
  }

  return Array.from(stationMap.values()).slice(0, limit);
};
