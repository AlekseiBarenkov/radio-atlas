import type { RadioStation } from '../model/types';

const hasValue = (value: string): boolean => {
  return value.trim().length > 0;
};

const hasTags = (tags: string): boolean => {
  return tags.split(',').some((tag) => tag.trim().length > 0);
};

export const hasSimilarStationsSource = (station: RadioStation): boolean => {
  return hasTags(station.tags) || hasValue(station.country) || hasValue(station.state) || hasValue(station.language);
};
