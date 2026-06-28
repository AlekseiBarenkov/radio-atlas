import { useResponsive } from '@/app/providers/responsive';
import { useTranslation } from '@/features/localization';
import type { UserProxy } from '@/features/player-proxy/model/types';
import { Badge, IconButton } from '@/shared/ui';
import { Pencil, Power, PowerOff, RotateCw, Trash2 } from 'lucide-react';
import S from './proxy-settings-item.module.css';
import { useState } from 'react';

type ActionsProps = {
  enabled: UserProxy['enabled'];
  onToggleEnabled: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onCheck: () => Promise<void>;
};

const Actions = (props: ActionsProps) => {
  const { enabled, onToggleEnabled, onRemove, onEdit } = props;

  const t = useTranslation();

  return (
    <div className={S.iconActions}>
      <IconButton
        size="m"
        className={S.statusAction}
        data-enabled={enabled || undefined}
        aria-label={enabled ? t.proxySettings.disableProxy : t.proxySettings.enableProxy}
        onClick={onToggleEnabled}
      >
        {enabled ? <Power /> : <PowerOff />}
      </IconButton>

      <IconButton className={S.editAction} size="m" aria-label={t.proxySettings.editProxy} onClick={onEdit}>
        <Pencil />
      </IconButton>

      <IconButton className={S.trashAction} size="m" aria-label={t.proxySettings.removeProxy} onClick={onRemove}>
        <Trash2 />
      </IconButton>
    </div>
  );
};

type ProxySettingsItemProps = Omit<ActionsProps, 'enabled'> & {
  proxy: UserProxy;
  isRadioBrowserProxyActive: boolean;
};

export const ProxySettingsItem = (props: ProxySettingsItemProps) => {
  const { proxy, isRadioBrowserProxyActive, ...actionsProps } = props;

  const [isChecking, setChecking] = useState(false);

  const { isMobile } = useResponsive();

  const t = useTranslation();

  const checkProxyHandler = () => {
    setChecking(true);
    actionsProps.onCheck().finally(() => setChecking(false));
  };

  return (
    <section className={S.item}>
      <div className={S.summary}>
        <div className={S.titleRow}>
          <div className={S.titleGroup}>
            <h2 className={S.title}>{proxy.name}</h2>
          </div>
          {!isMobile && <Actions enabled={proxy.enabled} {...actionsProps} />}
        </div>

        <div className={S.endpoint}>
          {proxy.host}
          {proxy.port === null ? '' : `:${proxy.port}`}
        </div>
      </div>

      <div className={S.statusRow}>
        {isRadioBrowserProxyActive && <Badge tone="info">{t.proxySettings.radioBrowserProxyActive}</Badge>}

        {proxy.availability === true && <Badge tone="success">{t.proxySettings.proxyAvailable}</Badge>}

        {proxy.availability === false && <Badge tone="danger">{t.proxySettings.proxyUnavailable}</Badge>}

        {proxy.availability === undefined && <Badge>{t.proxySettings.proxyUnchecked}</Badge>}

        <IconButton size="s" disabled={isChecking} aria-label={t.proxySettings.checkProxy} onClick={checkProxyHandler}>
          <RotateCw size={14} className={S.spinIcon} aria-hidden="true" data-spin={isChecking} />
        </IconButton>
      </div>

      {isMobile && <Actions enabled={proxy.enabled} {...actionsProps} />}
    </section>
  );
};
