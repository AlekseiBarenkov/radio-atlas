import type { CloudSyncProviderAdapter } from '../../model/provider';
import type { CloudSyncStatus } from '../../model/types';
import { CLOUD_SYNC_STATUSES } from '../../model/types';
import { applySyncData, buildSyncData } from '../sync-data';

type ReconcileResult = {
  status: CloudSyncStatus;
  lastSyncedAt: string | null;
  localUpdatedAt: string | null;
};

type ReconcileParams = {
  lastSyncedAt: string | null;
  localUpdatedAt: string | null;
};

const isAfter = (date: string | null, baseDate: string | null): boolean => {
  if (date === null) {
    return false;
  }

  if (baseDate === null) {
    return true;
  }

  return Date.parse(date) > Date.parse(baseDate);
};

const isSameSyncPoint = (params: ReconcileParams): boolean => {
  return params.lastSyncedAt !== null && params.localUpdatedAt === params.lastSyncedAt;
};

export const reconcileWithProvider = async (
  provider: CloudSyncProviderAdapter,
  params: ReconcileParams,
): Promise<ReconcileResult> => {
  if (params.localUpdatedAt !== null && isAfter(params.localUpdatedAt, params.lastSyncedAt)) {
    const localSyncData = buildSyncData(params.localUpdatedAt);

    await provider.save(localSyncData);

    return {
      status: CLOUD_SYNC_STATUSES.SYNCED,
      lastSyncedAt: params.localUpdatedAt,
      localUpdatedAt: params.localUpdatedAt,
    };
  }

  if (isSameSyncPoint(params)) {
    return {
      status: CLOUD_SYNC_STATUSES.SYNCED,
      lastSyncedAt: params.lastSyncedAt,
      localUpdatedAt: params.localUpdatedAt,
    };
  }

  const remoteSyncData = await provider.load();

  if (remoteSyncData === null) {
    const localSyncData = buildSyncData();

    await provider.save(localSyncData);

    return {
      status: CLOUD_SYNC_STATUSES.SYNCED,
      lastSyncedAt: localSyncData.updatedAt,
      localUpdatedAt: localSyncData.updatedAt,
    };
  }

  applySyncData(remoteSyncData);

  return {
    status: CLOUD_SYNC_STATUSES.SYNCED,
    lastSyncedAt: remoteSyncData.updatedAt,
    localUpdatedAt: remoteSyncData.updatedAt,
  };
};
