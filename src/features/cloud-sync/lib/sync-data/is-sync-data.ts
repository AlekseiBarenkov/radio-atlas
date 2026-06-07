import { isRadioStation } from '@entities/station';
import type { SyncData, SyncProxy } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isSyncProxy = (value: unknown): value is SyncProxy => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.host === 'string' &&
    (typeof value.port === 'number' || value.port === null) &&
    typeof value.token === 'string' &&
    typeof value.enabled === 'boolean'
  );
};

export const isSyncData = (value: unknown): value is SyncData => {
  if (!isRecord(value)) {
    return false;
  }

  if (value.version !== 1 || value.app !== 'radio-atlas' || typeof value.updatedAt !== 'string') {
    return false;
  }

  if (!isRecord(value.data)) {
    return false;
  }

  return (
    Array.isArray(value.data.favorites) &&
    value.data.favorites.every(isRadioStation) &&
    Array.isArray(value.data.proxies) &&
    value.data.proxies.every(isSyncProxy)
  );
};
