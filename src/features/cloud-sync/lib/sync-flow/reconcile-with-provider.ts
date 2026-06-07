import type { CloudSyncProviderAdapter } from '../../model/provider';
import type { CloudSyncStatus } from '../../model/types';
import { CLOUD_SYNC_STATUSES } from '../../model/types';
import type { SyncRemoteBackup } from '../sync-data';
import { applySyncData, buildSyncData } from '../sync-data';

type ReconcileResult = {
  status: CloudSyncStatus;
  lastSyncedAt: string | null;
  localUpdatedAt: string | null;
  remoteRevision: string | null;
};

type ReconcileParams = {
  lastSyncedAt: string | null;
  localUpdatedAt: string | null;
  remoteRevision: string | null;
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

const hasUnexpectedRemoteChange = (
  remoteBackup: SyncRemoteBackup | null,
  expectedRemoteRevision: string | null,
): boolean => {
  if (remoteBackup === null || expectedRemoteRevision === null || remoteBackup.remoteRevision === null) {
    return false;
  }

  return remoteBackup.remoteRevision !== expectedRemoteRevision;
};

export const reconcileWithProvider = async (
  provider: CloudSyncProviderAdapter,
  params: ReconcileParams,
): Promise<ReconcileResult> => {
  if (params.localUpdatedAt !== null && isAfter(params.localUpdatedAt, params.lastSyncedAt)) {
    const remoteBackup = params.lastSyncedAt === null ? null : await provider.load();

    if (hasUnexpectedRemoteChange(remoteBackup, params.remoteRevision)) {
      return {
        status: CLOUD_SYNC_STATUSES.CONFLICT,
        lastSyncedAt: params.lastSyncedAt,
        localUpdatedAt: params.localUpdatedAt,
        remoteRevision: params.remoteRevision,
      };
    }

    const localSyncData = buildSyncData(params.localUpdatedAt);
    const saveResult = await provider.save(localSyncData);

    return {
      status: CLOUD_SYNC_STATUSES.SYNCED,
      lastSyncedAt: params.localUpdatedAt,
      localUpdatedAt: params.localUpdatedAt,
      remoteRevision: saveResult.remoteRevision,
    };
  }

  if (isSameSyncPoint(params)) {
    return {
      status: CLOUD_SYNC_STATUSES.SYNCED,
      lastSyncedAt: params.lastSyncedAt,
      localUpdatedAt: params.localUpdatedAt,
      remoteRevision: params.remoteRevision,
    };
  }

  const remoteBackup = await provider.load();

  if (remoteBackup === null) {
    const localSyncData = buildSyncData();
    const saveResult = await provider.save(localSyncData);

    return {
      status: CLOUD_SYNC_STATUSES.SYNCED,
      lastSyncedAt: localSyncData.updatedAt,
      localUpdatedAt: localSyncData.updatedAt,
      remoteRevision: saveResult.remoteRevision,
    };
  }

  applySyncData(remoteBackup.syncData);

  return {
    status: CLOUD_SYNC_STATUSES.SYNCED,
    lastSyncedAt: remoteBackup.syncData.updatedAt,
    localUpdatedAt: remoteBackup.syncData.updatedAt,
    remoteRevision: remoteBackup.remoteRevision,
  };
};
