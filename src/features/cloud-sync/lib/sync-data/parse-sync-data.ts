import { isSyncData } from './is-sync-data';
import type { SyncData } from './types';

export const parseSyncData = (rawValue: string): SyncData | null => {
  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isSyncData(parsedValue)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};
