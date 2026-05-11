import { useResponsive } from '@/app/providers/responsive';
import { useTranslation } from '@/features/localization';
import { Button, Modal, Notice } from '@/shared/ui';
import { useMemo, useState } from 'react';
import { usePlayerProxyStore } from '../../model/player-proxy-store';
import type { UserProxy } from '../../model/types';
import { ProxySettingsForm } from './proxy-settings-form';
import S from './proxy-settings.module.css';
import { ProxySettingsItem } from './proxy-settings-item';
import { sortUserProxies } from '../../lib/sort-user-proxies';
import {
  validateUserProxyInput,
  type UserProxyInputFieldErrors,
  type UserProxyInputFormValue,
} from '../../lib/validate-user-proxy-input';
import { TOAST_TONES, useToastActions } from '@/features/toast';

type ProxyPanelState =
  | {
      open: boolean;
      mode: 'create';
      proxyId: null;
    }
  | {
      open: boolean;
      mode: 'edit';
      proxyId: string;
    };

type DeleteProxyState = {
  open: boolean;
  proxy: UserProxy;
};

const createEmptyFormState = (name: string): UserProxyInputFormValue => ({
  name,
  host: '',
  port: '',
  token: '',
});

const mapProxyToFormState = (proxy: UserProxy): UserProxyInputFormValue => ({
  name: proxy.name,
  host: proxy.host,
  port: proxy.port === null ? '' : String(proxy.port),
  token: proxy.token,
});

export const ProxySettings = () => {
  const t = useTranslation();
  const { showToast } = useToastActions();
  const { isDesktop } = useResponsive();

  const storedProxies = usePlayerProxyStore((state) => state.proxies);
  const proxies = useMemo(() => sortUserProxies(storedProxies), [storedProxies]);

  const actions = usePlayerProxyStore((state) => state.actions);

  const [panelState, setPanelState] = useState<ProxyPanelState | null>(null);
  const [formValue, setFormValue] = useState<UserProxyInputFormValue>(() =>
    createEmptyFormState(t.proxySettings.newProxyName),
  );
  const [fieldErrors, setFieldErrors] = useState<UserProxyInputFieldErrors>({});
  const [deleteProxyState, setDeleteProxyState] = useState<DeleteProxyState | null>(null);

  const closePanel = () => {
    setPanelState((prev) => (prev === null ? null : { ...prev, open: false }));
    setFieldErrors({});
  };

  const openCreatePanel = () => {
    setFormValue(createEmptyFormState(t.proxySettings.newProxyName));
    setFieldErrors({});
    setPanelState({
      open: true,
      mode: 'create',
      proxyId: null,
    });
  };

  const openEditPanel = (proxy: UserProxy) => {
    setFormValue(mapProxyToFormState(proxy));
    setFieldErrors({});
    setPanelState({
      open: true,
      mode: 'edit',
      proxyId: proxy.id,
    });
  };

  const getCurrentProxy = (): UserProxy | null => {
    if (!panelState || panelState.mode !== 'edit') {
      return null;
    }

    return proxies.find((proxy) => proxy.id === panelState.proxyId) ?? null;
  };

  const saveProxy = () => {
    if (!panelState?.open) {
      return;
    }

    const currentProxy = getCurrentProxy();

    const validation = validateUserProxyInput(formValue, currentProxy?.enabled ?? true, t);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);

      showToast({
        tone: TOAST_TONES.ERROR,
        title: t.proxySettings.validationError,
        description: Object.values(validation.errors).join('\n'),
      });

      return;
    }

    if (panelState.mode === 'create') {
      actions.addProxy(validation.input);
    } else {
      actions.updateProxy(panelState.proxyId, validation.input);
    }

    closePanel();
  };

  const closeDeleteConfirm = () => {
    setDeleteProxyState((prev) => (prev === null ? null : { ...prev, open: false }));
  };

  const confirmDeleteProxy = () => {
    if (deleteProxyState === null) {
      return;
    }

    actions.removeProxy(deleteProxyState.proxy.id);
    closeDeleteConfirm();
  };

  const modalTitle = panelState?.mode === 'edit' ? t.proxySettings.editProxy : t.proxySettings.addProxy;

  return (
    <div className={S.root}>
      <div className={S.toolbar}>
        <Button onClick={openCreatePanel}>{t.proxySettings.addProxy}</Button>
      </div>

      {proxies.length === 0 && <Notice title={t.proxySettings.empty} />}

      {proxies.length > 0 && (
        <div className={S.list}>
          {proxies.map((proxy) => (
            <ProxySettingsItem
              key={proxy.id}
              proxy={proxy}
              onToggleEnabled={() => actions.toggleProxyEnabled(proxy.id)}
              onEdit={() => openEditPanel(proxy)}
              onRemove={() => setDeleteProxyState({ open: true, proxy })}
              onCheck={() => actions.checkProxy(proxy.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!panelState?.open}
        view={isDesktop ? 'dialog' : 'drawer'}
        closeLabel={t.common.close}
        onOpenChange={(open) => {
          if (!open) {
            closePanel();
          }
        }}
        header={<h2 className={S.modalTitle}>{modalTitle}</h2>}
        footer={
          <>
            <Button variant="secondary" onClick={closePanel}>
              {t.common.close}
            </Button>

            <Button onClick={saveProxy}>{modalTitle}</Button>
          </>
        }
      >
        <ProxySettingsForm
          value={formValue}
          fieldErrors={fieldErrors}
          onChange={(nextValue) => {
            setFormValue(nextValue);
            setFieldErrors({});
          }}
        />
      </Modal>

      <Modal
        open={!!deleteProxyState?.open}
        view={isDesktop ? 'dialog' : 'drawer'}
        closeLabel={t.common.close}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteConfirm();
          }
        }}
        header={<h2 className={S.modalTitle}>{t.proxySettings.deleteProxyTitle}</h2>}
        footer={
          <>
            <Button variant="secondary" onClick={closeDeleteConfirm}>
              {t.proxySettings.cancel}
            </Button>

            <Button onClick={confirmDeleteProxy}>{t.proxySettings.removeProxy}</Button>
          </>
        }
      >
        <p className={S.confirmText}>
          {t.proxySettings.deleteProxyDescription}
          {deleteProxyState && <span className={S.confirmName}>{deleteProxyState.proxy.name}</span>}
        </p>
      </Modal>
    </div>
  );
};
