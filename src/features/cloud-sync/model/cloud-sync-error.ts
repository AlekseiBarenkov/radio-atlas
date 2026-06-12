import type { CloudSyncErrorCode } from './types';

export class CloudSyncError extends Error {
  readonly code: CloudSyncErrorCode;

  constructor(code: CloudSyncErrorCode) {
    super(code);
    this.name = 'CloudSyncError';
    this.code = code;
  }
}

export class CloudSyncCancelledError extends Error {
  constructor() {
    super('Cloud sync operation was cancelled');
    this.name = 'CloudSyncCancelledError';
  }
}

export const isCloudSyncCancelledError = (error: unknown): boolean => {
  return error instanceof CloudSyncCancelledError;
};

export const getCloudSyncErrorCode = (error: unknown, fallbackCode: CloudSyncErrorCode): CloudSyncErrorCode => {
  if (error instanceof CloudSyncError) {
    return error.code;
  }

  return fallbackCode;
};
