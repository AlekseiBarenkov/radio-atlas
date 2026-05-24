type ParsedStationMetadataTitle = {
  artist: string | null;
  title: string;
  rawTitle: string;
};

export const parseStationMetadataTitle = (rawTitle: string): ParsedStationMetadataTitle | null => {
  const normalizedTitle = rawTitle.trim();

  if (normalizedTitle.length === 0) {
    return null;
  }

  const separator = ' - ';
  const separatorIndex = normalizedTitle.indexOf(separator);

  if (separatorIndex <= 0) {
    return {
      artist: null,
      title: normalizedTitle,
      rawTitle: normalizedTitle,
    };
  }

  const artist = normalizedTitle.slice(0, separatorIndex).trim();
  const title = normalizedTitle.slice(separatorIndex + separator.length).trim();

  if (title.length === 0) {
    return {
      artist: null,
      title: normalizedTitle,
      rawTitle: normalizedTitle,
    };
  }

  return {
    artist: artist.length > 0 ? artist : null,
    title,
    rawTitle: normalizedTitle,
  };
};
