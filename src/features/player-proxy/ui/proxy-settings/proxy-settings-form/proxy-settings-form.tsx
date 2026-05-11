import { Input } from '@/shared/ui';
import { useTranslation } from '@/features/localization';
import S from './proxy-settings-form.module.css';
import type { UserProxyInputFieldErrors, UserProxyInputFormValue } from '../../../lib/validate-user-proxy-input';

type ProxySettingsFormProps = {
  value: UserProxyInputFormValue;
  fieldErrors: UserProxyInputFieldErrors;
  onChange: (value: UserProxyInputFormValue) => void;
};

const RequiredMark = () => (
  <span className={S.requiredMark} aria-hidden="true">
    *
  </span>
);

export const ProxySettingsForm = (props: ProxySettingsFormProps) => {
  const { value, fieldErrors, onChange } = props;

  const t = useTranslation();

  return (
    <div className={S.form}>
      <label className={S.field}>
        <span>
          {t.proxySettings.name}
          <RequiredMark />
        </span>
        <Input
          invalid={Boolean(fieldErrors.name)}
          required
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
      </label>

      <label className={S.field}>
        <span>
          {t.proxySettings.host}
          <RequiredMark />
        </span>

        <Input
          required
          invalid={Boolean(fieldErrors.host)}
          value={value.host}
          placeholder={t.proxySettings.hostPlaceholder}
          onChange={(event) => onChange({ ...value, host: event.target.value })}
        />
      </label>

      <label className={S.field}>
        <span>{t.proxySettings.port}</span>
        <Input
          invalid={Boolean(fieldErrors.port)}
          value={value.port}
          placeholder={t.proxySettings.portPlaceholder}
          inputMode="numeric"
          onChange={(event) => onChange({ ...value, port: event.target.value })}
        />
      </label>

      <label className={S.field}>
        <span>{t.proxySettings.token}</span>
        <Input
          value={value.token}
          placeholder={t.proxySettings.tokenPlaceholder}
          onChange={(event) => onChange({ ...value, token: event.target.value })}
        />
      </label>
    </div>
  );
};
