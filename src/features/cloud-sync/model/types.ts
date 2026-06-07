export const CLOUD_SYNC_STATUSES = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed',
  CONFLICT: 'conflict',
} as const;

export const CLOUD_PROVIDERS = {
  GOOGLE_DRIVE: 'google-drive',
} as const;

export type CloudSyncStatus = (typeof CLOUD_SYNC_STATUSES)[keyof typeof CLOUD_SYNC_STATUSES];

export type CloudProvider = (typeof CLOUD_PROVIDERS)[keyof typeof CLOUD_PROVIDERS];

export const CLOUD_SYNC_ERROR_CODES = {
  SYNC_FAILED: 'sync-failed',
  RESTORE_FAILED: 'restore-failed',
  BACKUP_NOT_FOUND: 'backup-not-found',
  GOOGLE_CLIENT_ID_MISSING: 'google-client-id-missing',
  GOOGLE_AUTH_FAILED: 'google-auth-failed',
} as const;

export type CloudSyncErrorCode = (typeof CLOUD_SYNC_ERROR_CODES)[keyof typeof CLOUD_SYNC_ERROR_CODES];
