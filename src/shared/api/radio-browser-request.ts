import {
  getIsRadioBrowserProxyFallbackEnabled,
  getRadioBrowserRequestTransports,
  markRadioBrowserDirectFailure,
  resetRadioBrowserDirectFailures,
  type RadioBrowserRequestTransport,
} from './radio-browser-api';

type RequestMethod = 'GET';

type RadioBrowserRequestOptions = {
  method?: RequestMethod;
  signal?: AbortSignal;
};

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error('Radio Browser request failed');
};

const getHasProxyTransport = (transports: RadioBrowserRequestTransport[]): boolean => {
  return transports.some((transport) => transport.type === 'proxy');
};

const getShouldSkipTransport = (transport: RadioBrowserRequestTransport, hasProxyTransport: boolean): boolean => {
  if (!hasProxyTransport) {
    return false;
  }

  if (getIsRadioBrowserProxyFallbackEnabled()) {
    return transport.type === 'direct';
  }

  return transport.type === 'proxy';
};

const fetchJson = async <TResponse>(
  transport: RadioBrowserRequestTransport,
  options: RadioBrowserRequestOptions,
): Promise<TResponse> => {
  const { method = 'GET', signal } = options;

  const response = await fetch(transport.url, {
    method,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
};

export const radioBrowserRequest = async <TResponse>(
  input: string,
  options: RadioBrowserRequestOptions = {},
): Promise<TResponse> => {
  const transports = getRadioBrowserRequestTransports(input);
  const hasProxyTransport = getHasProxyTransport(transports);

  let lastError: Error | null = null;

  for (const transport of transports) {
    if (getShouldSkipTransport(transport, hasProxyTransport)) {
      continue;
    }

    try {
      const response = await fetchJson<TResponse>(transport, options);

      if (transport.type === 'direct') {
        resetRadioBrowserDirectFailures();
      }

      return response;
    } catch (error) {
      const requestError = toError(error);

      if (options.signal?.aborted) {
        throw requestError;
      }

      lastError = requestError;

      if (transport.type === 'direct') {
        markRadioBrowserDirectFailure();

        if (!getIsRadioBrowserProxyFallbackEnabled()) {
          break;
        }
      }
    }
  }

  throw lastError ?? new Error('Radio Browser request failed');
};
