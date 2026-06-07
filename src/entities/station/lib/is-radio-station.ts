import type { RadioStation } from '../model/types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const isRadioStation = (value: unknown): value is RadioStation => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.stationuuid === 'string' &&
    typeof value.name === 'string' &&
    typeof value.url === 'string' &&
    typeof value.url_resolved === 'string'
  );
};
