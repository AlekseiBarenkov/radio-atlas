import type { StationMetadataAdapterInput, StationMetadataResult } from '../../model/types';
import { parseAzuraCastNowPlaying } from './parse-azuracast-nowplaying';
import { parseIcecastStatusJson } from './parse-icecast-status-json';
import { parseShoutcastCurrentSong } from './parse-shoutcast-current-song';
import { parseShoutcastPlayedHtml } from './parse-shoutcast-played-html';
import { parseShoutcastStatsJson } from './parse-shoutcast-stats-json';

type StationMetadataAdapter = (input: StationMetadataAdapterInput) => StationMetadataResult | null;

const adapters: StationMetadataAdapter[] = [
  parseAzuraCastNowPlaying,
  parseIcecastStatusJson,
  parseShoutcastStatsJson,
  parseShoutcastCurrentSong,
  parseShoutcastPlayedHtml,
];

export const parseStationMetadata = (input: StationMetadataAdapterInput): StationMetadataResult | null => {
  for (const adapter of adapters) {
    const result = adapter(input);

    if (result) {
      return result;
    }
  }

  return null;
};
