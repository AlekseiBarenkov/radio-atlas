import type { StationMetadataAdapterInput, StationMetadataResult } from '../../model/types';
import { parseStationMetadataTitle } from './parse-station-metadata-title';

const isTextResponse = (contentType: string): boolean => {
  return contentType.toLowerCase().includes('text/plain');
};

export const parseShoutcastCurrentSong = (input: StationMetadataAdapterInput): StationMetadataResult | null => {
  if (!isTextResponse(input.contentType)) {
    return null;
  }

  const parsedTitle = parseStationMetadataTitle(input.body);

  if (!parsedTitle) {
    return null;
  }

  return {
    source: 'shoutcast-current-song',
    nowPlaying: {
      artist: parsedTitle.artist,
      title: parsedTitle.title,
      rawTitle: parsedTitle.rawTitle,
      updatedAt: null,
    },
    history: [],
  };
};
