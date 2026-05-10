import { Input } from '@/shared/ui';
import { useTranslation } from '@/features/localization';
import S from './proxy-settings-form.module.css';

export type ProxySettingsFormValue = {
  name: string;
  host: string;
  port: string;
  token: string;
};

type ProxySettingsFormProps = {
  value: ProxySettingsFormValue;
  errorMessage: string | null;
  onChange: (value: ProxySettingsFormValue) => void;
};

export const ProxySettingsForm = (props: ProxySettingsFormProps) => {
  const { value, errorMessage, onChange } = props;

  const t = useTranslation();

  return (
    <div className={S.form}>
      {errorMessage && <div className={S.error}>{errorMessage}</div>}

      <label className={S.field}>
        <span>{t.proxySettings.name}</span>
        <Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
      </label>

      <label className={S.field}>
        <span>{t.proxySettings.host}</span>
        <Input
          value={value.host}
          placeholder={t.proxySettings.hostPlaceholder}
          onChange={(event) => onChange({ ...value, host: event.target.value })}
        />
      </label>

      <label className={S.field}>
        <span>{t.proxySettings.port}</span>
        <Input
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
