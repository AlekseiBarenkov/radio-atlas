import type { UserProxyInput } from '../model/types';

type NormalizeUserProxyInputResult =
  | {
      isValid: true;
      input: UserProxyInput;
    }
  | {
      isValid: false;
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

export const normalizeUserProxyInput = (params: {
  name: string;
  host: string;
  port: string;
  token: string;
  enabled: boolean;
}): NormalizeUserProxyInputResult => {
  const name = params.name.trim();
  const host = normalizeProxyHost(params.host);
  const token = params.token.trim();
  const port = parseProxyPort(params.port);

  if (!name || !host || !token || !isValidProxyHost(host)) {
    return {
      isValid: false,
    };
  }

  if (params.port.trim().length > 0 && port === null) {
    return {
      isValid: false,
    };
  }

  return {
    isValid: true,
    input: {
      name,
      host,
      port,
      token,
      enabled: params.enabled,
    },
  };
};
