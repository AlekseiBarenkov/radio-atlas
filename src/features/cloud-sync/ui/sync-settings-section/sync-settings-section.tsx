import { useTranslation } from '@/features/localization';
import { Badge, Button, Modal, Notice, ToggleGroup, type BadgeTone } from '@/shared/ui';
import {
  CLOUD_PROVIDERS,
  CLOUD_SYNC_ERROR_CODES,
  CLOUD_SYNC_STATUSES,
  useCloudSyncStore,
  type CloudProvider,
  type CloudSyncErrorCode,
  type CloudSyncStatus,
} from '@features/cloud-sync';
import S from './sync-settings-section.module.css';
import { useState } from 'react';
import { useResponsive } from '@/app/providers/responsive';

type ProviderOption = 'none' | CloudProvider;

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
  ];

  const [isRestoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  const activeProvider = useCloudSyncStore((state) => state.activeProvider);
  const autoSyncEnabled = useCloudSyncStore((state) => state.autoSyncEnabled);
  const lastSyncedAt = useCloudSyncStore((state) => state.lastSyncedAt);
  const status = useCloudSyncStore((state) => state.status);
  const errorCode = useCloudSyncStore((state) => state.errorCode);
  const actions = useCloudSyncStore((state) => state.actions);

  const selectedProvider: ProviderOption = activeProvider ?? 'none';

  const isProviderSelected = activeProvider !== null;
  const hasSuccessfulSync = lastSyncedAt !== null;
  const primarySyncLabel = hasSuccessfulSync ? t.syncSettings.syncNow : t.syncSettings.connectAndSync;

  const statusLabelByStatus: Record<CloudSyncStatus, string> = {
    [CLOUD_SYNC_STATUSES.IDLE]: t.syncSettings.idle,
    [CLOUD_SYNC_STATUSES.SYNCING]: t.syncSettings.syncing,
    [CLOUD_SYNC_STATUSES.SYNCED]: t.syncSettings.synced,
    [CLOUD_SYNC_STATUSES.FAILED]: t.syncSettings.failed,
    [CLOUD_SYNC_STATUSES.CONFLICT]: t.syncSettings.conflict,
  };

  const statusLabel =
    status === CLOUD_SYNC_STATUSES.IDLE && isProviderSelected
      ? t.syncSettings.readyToConnect
      : status === CLOUD_SYNC_STATUSES.SYNCED && hasSuccessfulSync
        ? t.syncSettings.connected
        : statusLabelByStatus[status];

  const statusToneByStatus: Record<CloudSyncStatus, BadgeTone> = {
    [CLOUD_SYNC_STATUSES.IDLE]: 'neutral',
    [CLOUD_SYNC_STATUSES.SYNCING]: 'info',
    [CLOUD_SYNC_STATUSES.SYNCED]: 'success',
    [CLOUD_SYNC_STATUSES.FAILED]: 'danger',
    [CLOUD_SYNC_STATUSES.CONFLICT]: 'warning',
  };

  const statusTone = statusToneByStatus[status];

  const errorLabelByCode: Record<CloudSyncErrorCode, string> = {
    [CLOUD_SYNC_ERROR_CODES.SYNC_FAILED]: t.syncSettings.syncFailed,
    [CLOUD_SYNC_ERROR_CODES.RESTORE_FAILED]: t.syncSettings.restoreFailed,
    [CLOUD_SYNC_ERROR_CODES.BACKUP_NOT_FOUND]: t.syncSettings.backupNotFound,
    [CLOUD_SYNC_ERROR_CODES.GOOGLE_CLIENT_ID_MISSING]: t.syncSettings.googleClientIdMissing,
    [CLOUD_SYNC_ERROR_CODES.GOOGLE_AUTH_FAILED]: t.syncSettings.googleAuthFailed,
  };

  const formattedLastSyncedAt =
    lastSyncedAt === null ? t.syncSettings.neverSynced : new Date(lastSyncedAt).toLocaleString();

  const changeProvider = (provider: ProviderOption) => {
    actions.setActiveProvider(provider === 'none' ? null : provider);
  };

  const confirmRestore = () => {
    actions.restoreFromBackup();
    setRestoreConfirmOpen(false);
  };

  const runPrimarySync = () => {
    if (hasSuccessfulSync) {
      actions.syncNow();
      return;
    }

    actions.reconcileOnStart();
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
            <label className={S.checkboxRow}>
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(event) => actions.setAutoSyncEnabled(event.target.checked)}
              />

              <span>{t.syncSettings.automaticSync}</span>
            </label>

            <div className={S.metaRow}>
              <span className={S.label}>{t.syncSettings.status}</span>
              <Badge tone={statusTone}>{statusLabel}</Badge>
            </div>

            <div className={S.metaRow}>
              <span className={S.label}>{t.syncSettings.lastSyncedAt}</span>
              <span className={S.value}>{formattedLastSyncedAt}</span>
            </div>

            {errorCode && <Notice title={errorLabelByCode[errorCode]} tone="error" />}

            {status === CLOUD_SYNC_STATUSES.CONFLICT && (
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

            {status !== CLOUD_SYNC_STATUSES.CONFLICT && (
              <div className={S.actions}>
                <Button onClick={runPrimarySync} disabled={status === CLOUD_SYNC_STATUSES.SYNCING}>
                  {primarySyncLabel}
                </Button>

                {hasSuccessfulSync && (
                  <Button
                    variant="secondary"
                    onClick={() => setRestoreConfirmOpen(true)}
                    disabled={status === CLOUD_SYNC_STATUSES.SYNCING}
                  >
                    {t.syncSettings.restoreBackup}
                  </Button>
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
