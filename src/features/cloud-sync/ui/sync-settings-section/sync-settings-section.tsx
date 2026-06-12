import { useTranslation } from '@/features/localization';
import { Badge, Button, Modal, Notice, ToggleGroup, type BadgeTone } from '@/shared/ui';
import {
  CLOUD_PROVIDERS,
  CLOUD_SYNC_ERROR_CODES,
  CLOUD_SYNC_STATUSES,
  useCloudSyncStore,
  type CloudProvider,
  type CloudSyncErrorCode,
} from '@features/cloud-sync';
import S from './sync-settings-section.module.css';
import { useState } from 'react';
import { useResponsive } from '@/app/providers/responsive';

type ProviderOption = 'none' | CloudProvider;

const isLocalSyncedWithProvider = (localUpdatedAt: string | null, lastSyncedAt: string | null): boolean => {
  return localUpdatedAt !== null && lastSyncedAt !== null && localUpdatedAt === lastSyncedAt;
};

export const SyncSettingsSection = () => {
  const { isDesktop } = useResponsive();
  const t = useTranslation();

  const providerOptions: { value: ProviderOption; label: string }[] = [
    {
      value: 'none',
      label: t.syncSettings.noProvider,
    },
    {
      value: CLOUD_PROVIDERS.GOOGLE_DRIVE,
      label: 'Google Drive',
    },
    {
      value: CLOUD_PROVIDERS.YANDEX_DISK,
      label: 'Yandex Disk',
    },
  ];

  const [isRestoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  const activeProvider = useCloudSyncStore((state) => state.activeProvider);
  const activeProviderState = useCloudSyncStore((state) => {
    if (state.activeProvider === null) {
      return null;
    }

    return state.providers[state.activeProvider] ?? null;
  });
  const localUpdatedAt = useCloudSyncStore((state) => state.localUpdatedAt);
  const providerOperationState = useCloudSyncStore((state) => {
    if (state.activeProvider === null) {
      return null;
    }

    return state.providerOperationState[state.activeProvider] ?? null;
  });

  const operationStatus = providerOperationState?.status ?? CLOUD_SYNC_STATUSES.IDLE;
  const errorCode = providerOperationState?.errorCode ?? null;
  const actions = useCloudSyncStore((state) => state.actions);

  const selectedProvider: ProviderOption = activeProvider ?? 'none';

  const isProviderSelected = activeProvider !== null;
  const isProviderConnected = (activeProviderState?.connectedAt ?? null) !== null;
  const autoSyncEnabled = activeProviderState?.autoSyncEnabled ?? false;
  const lastSyncedAt = activeProviderState?.lastSyncedAt ?? null;
  const hasSuccessfulSync = lastSyncedAt !== null;
  const isLocalSynced = isLocalSyncedWithProvider(localUpdatedAt, lastSyncedAt);
  const canUseCloudActions = isProviderConnected;
  const canUseAutoSync = isProviderConnected && hasSuccessfulSync;
  const shouldShowAutoSync = isProviderConnected;

  const isConnecting = operationStatus === CLOUD_SYNC_STATUSES.SYNCING && !isProviderConnected;
  const hasConnectionError = operationStatus === CLOUD_SYNC_STATUSES.FAILED && !isProviderConnected;

  const connectionLabel = isConnecting
    ? t.syncSettings.syncing
    : hasConnectionError
      ? t.syncSettings.failed
      : isProviderConnected
        ? t.syncSettings.connected
        : t.syncSettings.readyToConnect;

  const connectionTone: BadgeTone = isConnecting
    ? 'info'
    : hasConnectionError
      ? 'danger'
      : isProviderConnected
        ? 'success'
        : 'neutral';

  const isCloudDataOperation = operationStatus === CLOUD_SYNC_STATUSES.SYNCING && isProviderConnected;
  const hasCloudDataError = operationStatus === CLOUD_SYNC_STATUSES.FAILED && isProviderConnected;
  const hasCloudDataConflict = operationStatus === CLOUD_SYNC_STATUSES.CONFLICT;

  const syncStatusLabel = isCloudDataOperation
    ? t.syncSettings.syncing
    : hasCloudDataError
      ? t.syncSettings.failed
      : hasCloudDataConflict
        ? t.syncSettings.conflict
        : isLocalSynced
          ? t.syncSettings.synced
          : t.syncSettings.idle;

  const syncStatusTone: BadgeTone = isCloudDataOperation
    ? 'info'
    : hasCloudDataError
      ? 'danger'
      : hasCloudDataConflict
        ? 'warning'
        : isLocalSynced
          ? 'success'
          : 'neutral';

  const errorLabelByCode: Record<CloudSyncErrorCode, string> = {
    [CLOUD_SYNC_ERROR_CODES.SYNC_FAILED]: t.syncSettings.syncFailed,
    [CLOUD_SYNC_ERROR_CODES.RESTORE_FAILED]: t.syncSettings.restoreFailed,
    [CLOUD_SYNC_ERROR_CODES.BACKUP_NOT_FOUND]: t.syncSettings.backupNotFound,
    [CLOUD_SYNC_ERROR_CODES.GOOGLE_CLIENT_ID_MISSING]: t.syncSettings.googleClientIdMissing,
    [CLOUD_SYNC_ERROR_CODES.GOOGLE_AUTH_FAILED]: t.syncSettings.googleAuthFailed,
    [CLOUD_SYNC_ERROR_CODES.YANDEX_CLIENT_ID_MISSING]: t.syncSettings.yandexClientIdMissing,
    [CLOUD_SYNC_ERROR_CODES.YANDEX_AUTH_FAILED]: t.syncSettings.yandexAuthFailed,
  };

  const formattedLastSyncedAt =
    lastSyncedAt === null ? t.syncSettings.neverSynced : new Date(lastSyncedAt).toLocaleString();

  const changeProvider = (provider: ProviderOption) => {
    actions.setActiveProvider(provider === 'none' ? null : provider);
  };

  const connectProvider = () => {
    actions.connectProvider();
  };

  const confirmRestore = () => {
    actions.restoreFromBackup();
    setRestoreConfirmOpen(false);
  };

  const syncNow = () => {
    actions.syncNow();
  };

  return (
    <section className={S.section}>
      <header className={S.header}>
        <div>
          <h2 className={S.title}>{t.syncSettings.title}</h2>
          <p className={S.description}>{t.syncSettings.description}</p>
        </div>
      </header>

      <div className={S.content}>
        <div className={S.field}>
          <span className={S.label}>{t.syncSettings.provider}</span>

          <ToggleGroup
            label={t.syncSettings.provider}
            value={selectedProvider}
            options={providerOptions}
            onChange={changeProvider}
          />
        </div>

        {isProviderSelected && (
          <>
            {shouldShowAutoSync && (
              <>
                <label className={S.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    disabled={!canUseAutoSync}
                    onChange={(event) => actions.setAutoSyncEnabled(event.target.checked)}
                  />

                  <span>{t.syncSettings.automaticSync}</span>
                </label>

                {!canUseAutoSync && <Notice title={t.syncSettings.autoSyncDisabledUntilFirstSync} tone="info" />}
              </>
            )}

            <div className={S.metaRow}>
              <span className={S.label}>{t.syncSettings.status}</span>
              <Badge tone={connectionTone}>{connectionLabel}</Badge>
            </div>

            <div className={S.metaRow}>
              <span className={S.label}>{t.syncSettings.syncStatus}</span>
              <Badge tone={syncStatusTone}>{syncStatusLabel}</Badge>
            </div>

            <div className={S.metaRow}>
              <span className={S.label}>{t.syncSettings.lastSyncedAt}</span>
              <span className={S.value}>{formattedLastSyncedAt}</span>
            </div>

            {errorCode && <Notice title={errorLabelByCode[errorCode]} tone="error" />}

            {operationStatus === CLOUD_SYNC_STATUSES.CONFLICT && (
              <div className={S.conflictBox}>
                <Notice title={t.syncSettings.conflictDescription} tone="error" />

                <div className={S.conflictActions}>
                  <Button onClick={actions.syncNow}>{t.syncSettings.useLocalData}</Button>

                  <Button variant="secondary" onClick={() => setRestoreConfirmOpen(true)}>
                    {t.syncSettings.useBackupData}
                  </Button>
                </div>
              </div>
            )}

            {operationStatus !== CLOUD_SYNC_STATUSES.CONFLICT && (
              <div className={S.actions}>
                {!canUseCloudActions && (
                  <Button onClick={connectProvider} disabled={operationStatus === CLOUD_SYNC_STATUSES.SYNCING}>
                    {t.syncSettings.connect}
                  </Button>
                )}

                {canUseCloudActions && (
                  <>
                    <Button onClick={syncNow} disabled={operationStatus === CLOUD_SYNC_STATUSES.SYNCING}>
                      {t.syncSettings.syncNow}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setRestoreConfirmOpen(true)}
                      disabled={operationStatus === CLOUD_SYNC_STATUSES.SYNCING}
                    >
                      {t.syncSettings.restoreBackup}
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={isRestoreConfirmOpen}
        view={isDesktop ? 'dialog' : 'drawer'}
        closeLabel={t.common.close}
        onOpenChange={setRestoreConfirmOpen}
        header={<h2 className={S.modalTitle}>{t.syncSettings.restoreBackupTitle}</h2>}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRestoreConfirmOpen(false)}>
              {t.syncSettings.cancel}
            </Button>

            <Button onClick={confirmRestore}>{t.syncSettings.confirmRestore}</Button>
          </>
        }
      >
        <p className={S.confirmText}>{t.syncSettings.restoreBackupDescription}</p>
      </Modal>
    </section>
  );
};
