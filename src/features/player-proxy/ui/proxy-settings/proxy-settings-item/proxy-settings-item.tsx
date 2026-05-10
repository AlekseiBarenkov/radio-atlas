import { useResponsive } from '@/app/providers/responsive';
import { useLocalizationStore, useTranslation, type Language } from '@/features/localization';
import type { UserProxy } from '@/features/player-proxy/model/types';
import { IconButton } from '@/shared/ui';
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import S from './proxy-settings-item.module.css';

type ActionsProps = {
  enabled: UserProxy['enabled'];
  onToggleEnabled: () => void;
  onRemove: () => void;
  onEdit: () => void;
};

const formatProxyDate = (value: string | null, language: Language): string | null => {
  if (value === null) {
    return null;
  }
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';

  return new Date(value).toLocaleString(locale);
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
};

export const ProxySettingsItem = (props: ProxySettingsItemProps) => {
  const { proxy, ...actionsProps } = props;

  const { isMobile } = useResponsive();

  const t = useTranslation();
  const language = useLocalizationStore((state) => state.language);

  const lastSuccessAt = formatProxyDate(proxy.lastSuccessAt, language);
  const lastFailureAt = formatProxyDate(proxy.lastFailureAt, language);

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

      <div className={S.meta}>
        <span>
          {t.proxySettings.priority}: {proxy.priority}
        </span>
        <span>
          {t.proxySettings.successCount}: {proxy.successCount}
        </span>
        <span>
          {t.proxySettings.failureCount}: {proxy.failureCount}
        </span>

        {lastSuccessAt && (
          <span>
            {t.proxySettings.lastSuccessAt}: {lastSuccessAt}
          </span>
        )}

        {lastFailureAt && (
          <span>
            {t.proxySettings.lastFailureAt}: {lastFailureAt}
          </span>
        )}
      </div>

      {isMobile && <Actions enabled={proxy.enabled} {...actionsProps} />}
    </section>
  );
};
