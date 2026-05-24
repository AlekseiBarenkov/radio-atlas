import type { StationMetadataAdapterInput, StationMetadataResult, StationTrackHistoryItem } from '../../model/types';
import { parseStationMetadataTitle } from './parse-station-metadata-title';

const isHtmlResponse = (contentType: string): boolean => {
  return contentType.toLowerCase().includes('text/html');
};

const getCellText = (row: HTMLTableRowElement, cellIndex: number): string | null => {
  const value = row.cells.item(cellIndex)?.textContent?.trim() ?? '';

  return value.length > 0 ? value : null;
};

const parseRows = (body: string): StationTrackHistoryItem[] => {
  const document = new DOMParser().parseFromString(body, 'text/html');
  const rows = Array.from(document.querySelectorAll('tr'));

  const headerRowIndex = rows.findIndex((row) => {
    return getCellText(row, 0) === 'Played @' && getCellText(row, 1) === 'Song Title';
  });

  if (headerRowIndex < 0) {
    return [];
  }

  return rows
    .slice(headerRowIndex + 1)
    .map((row): StationTrackHistoryItem | null => {
      const playedAt = getCellText(row, 0);
      const title = getCellText(row, 1);

      if (!playedAt || !title) {
        return null;
      }

      return {
        playedAt,
        title,
      };
    })
    .filter((item): item is StationTrackHistoryItem => item !== null);
};

export const parseShoutcastPlayedHtml = (input: StationMetadataAdapterInput): StationMetadataResult | null => {
  if (!isHtmlResponse(input.contentType)) {
    return null;
  }

  const history = parseRows(input.body);

  if (history.length === 0) {
    return null;
  }

  const parsedTitle = parseStationMetadataTitle(history[0].title);

  return {
    source: 'shoutcast-played-html',
    nowPlaying: parsedTitle
      ? {
          artist: parsedTitle.artist,
          title: parsedTitle.title,
          rawTitle: parsedTitle.rawTitle,
          updatedAt: history[0].playedAt,
        }
      : null,
    history,
  };
};
