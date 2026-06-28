import {
  getIsRadioBrowserProxyFallbackEnabled,
  getRadioBrowserRequestTransports,
  markRadioBrowserDirectFailure,
  resetRadioBrowserDirectFailures,
  type RadioBrowserRequestTransport,
} from './radio-browser-api';

const RADIO_BROWSER_DIRECT_TIMEOUT_MS = 20_000;

type RequestMethod = 'GET';

type RadioBrowserRequestOptions = {
  method?: RequestMethod;
  signal?: AbortSignal;
};

type RequestSignal = {
  signal?: AbortSignal;
  cleanup: () => void;
};

const createRequestSignal = (signal: AbortSignal | undefined, timeoutMs: number | null): RequestSignal => {
  if (timeoutMs === null) {
    return {
      signal,
      cleanup: () => {},
    };
  }

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const abortFromSignal = () => {
    controller.abort();
  };

  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener('abort', abortFromSignal, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      signal?.removeEventListener('abort', abortFromSignal);
    },
  };
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
  timeoutMs: number | null,
): Promise<TResponse> => {
  const { method = 'GET', signal } = options;
  const requestSignal = createRequestSignal(signal, timeoutMs);

  try {
    const response = await fetch(transport.url, {
      method,
      signal: requestSignal.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } finally {
    requestSignal.cleanup();
  }
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
      const timeoutMs = transport.type === 'direct' && hasProxyTransport ? RADIO_BROWSER_DIRECT_TIMEOUT_MS : null;

      const response = await fetchJson<TResponse>(transport, options, timeoutMs);

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
