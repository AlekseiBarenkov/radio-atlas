import type { RadioStation } from '../model/types';

export const getStationStreamUrl = (station: RadioStation): string | null => {
  const resolvedUrl = station.url_resolved.trim();

  if (resolvedUrl.length > 0) {
    return resolvedUrl;
  }

  const url = station.url.trim();

  if (url.length > 0) {
    return url;
  }

  return null;
};
