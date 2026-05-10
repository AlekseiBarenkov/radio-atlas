import { useResponsive } from '@/app/providers/responsive';
import { useTranslation } from '@/features/localization';
import { Button, Modal, Notice } from '@/shared/ui';
import { useState } from 'react';
import { normalizeUserProxyInput } from '../../lib/normalize-user-proxy-input';
import { usePlayerProxyStore } from '../../model/player-proxy-store';
import type { UserProxy } from '../../model/types';
import { ProxySettingsForm, type ProxySettingsFormValue } from './proxy-settings-form';
import S from './proxy-settings.module.css';
import { ProxySettingsItem } from './proxy-settings-item';

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

const createEmptyFormState = (name: string): ProxySettingsFormValue => ({
  name,
  host: '',
  port: '',
  token: '',
});

const mapProxyToFormState = (proxy: UserProxy): ProxySettingsFormValue => ({
  name: proxy.name,
  host: proxy.host,
  port: proxy.port === null ? '' : String(proxy.port),
  token: proxy.token,
});

export const ProxySettings = () => {
  const t = useTranslation();
  const { isDesktop } = useResponsive();

  const proxies = usePlayerProxyStore((state) => state.proxies);
  const actions = usePlayerProxyStore((state) => state.actions);

  const [panelState, setPanelState] = useState<ProxyPanelState | null>(null);
  const [formValue, setFormValue] = useState<ProxySettingsFormValue>(() =>
    createEmptyFormState(t.proxySettings.newProxyName),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteProxyState, setDeleteProxyState] = useState<DeleteProxyState | null>(null);

  const closePanel = () => {
    setPanelState((prev) => (prev === null ? null : { ...prev, open: false }));
    setFormError(null);
  };

  const openCreatePanel = () => {
    setFormValue(createEmptyFormState(t.proxySettings.newProxyName));
    setFormError(null);
    setPanelState({
      open: true,
      mode: 'create',
      proxyId: null,
    });
  };

  const openEditPanel = (proxy: UserProxy) => {
    setFormValue(mapProxyToFormState(proxy));
    setFormError(null);
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

    const normalizedProxy = normalizeUserProxyInput({
      ...formValue,
      enabled: currentProxy?.enabled ?? true,
    });

    if (!normalizedProxy.isValid) {
      setFormError(t.proxySettings.validationError);

      return;
    }

    if (panelState.mode === 'create') {
      actions.addProxy(normalizedProxy.input);
    } else {
      actions.updateProxy(panelState.proxyId, normalizedProxy.input);
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
        <ProxySettingsForm value={formValue} errorMessage={formError} onChange={setFormValue} />
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
