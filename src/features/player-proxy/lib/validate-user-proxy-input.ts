import type { Translation } from '@features/localization';
import type { UserProxyInput } from '../model/types';

export type UserProxyInputFormValue = {
  name: string;
  host: string;
  port: string;
  token: string;
};

export type UserProxyInputFieldErrors = Partial<Record<keyof UserProxyInputFormValue, string>>;

type ValidateUserProxyInputResult =
  | {
      isValid: true;
      input: UserProxyInput;
      errors: UserProxyInputFieldErrors;
    }
  | {
      isValid: false;
      errors: UserProxyInputFieldErrors;
    };

const isValidProxyHost = (host: string): boolean => {
  return host.startsWith('http://') || host.startsWith('https://');
};

const normalizeProxyHost = (host: string): string => {
  return host.trim().replace(/\/+$/, '');
};

const parseProxyPort = (port: string): number | null => {
  const normalizedPort = port.trim();

  if (normalizedPort.length === 0) {
    return null;
  }

  const parsedPort = Number(normalizedPort);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
    return null;
  }

  return parsedPort;
};

export const validateUserProxyInput = (
  value: UserProxyInputFormValue,
  enabled: boolean,
  t: Translation,
): ValidateUserProxyInputResult => {
  const name = value.name.trim();
  const host = normalizeProxyHost(value.host);
  const token = value.token.trim();
  const port = parseProxyPort(value.port);

  const errors: UserProxyInputFieldErrors = {};

  if (!name) {
    errors.name = t.proxySettings.nameRequired;
  }

  if (!host) {
    errors.host = t.proxySettings.hostRequired;
  } else if (!isValidProxyHost(host)) {
    errors.host = t.proxySettings.hostInvalid;
  }

  if (value.port.trim().length > 0 && port === null) {
    errors.port = t.proxySettings.portInvalid;
  }

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors,
    input: {
      name,
      host,
      port,
      token,
      enabled,
    },
  };
};
