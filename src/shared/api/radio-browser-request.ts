import {
  getRadioBrowserRequestTransports,
  notifyRadioBrowserTransportSuccess,
  type RadioBrowserRequestTransport,
} from './radio-browser-api';

const RADIO_BROWSER_REQUEST_TIMEOUT_MS = 20_000;

type RequestMethod = 'GET';

type RadioBrowserRequestOptions = {
  method?: RequestMethod;
  signal?: AbortSignal;
};

type RequestSignal = {
  signal?: AbortSignal;
  timeoutPromise: Promise<never> | null;
  cleanup: () => void;
};

const createRequestSignal = (signal: AbortSignal | undefined, timeoutMs: number | null): RequestSignal => {
  if (timeoutMs === null) {
    return {
      signal,
      timeoutPromise: null,
      cleanup: () => {},
    };
  }

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error('Radio Browser request timed out'));
    }, timeoutMs);
  });

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
    timeoutPromise,
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

const fetchJson = async <TResponse>(
  transport: RadioBrowserRequestTransport,
  options: RadioBrowserRequestOptions,
  timeoutMs: number | null,
): Promise<TResponse> => {
  const { method = 'GET', signal } = options;
  const requestSignal = createRequestSignal(signal, timeoutMs);

  const requestPromise = fetch(transport.url, {
    method,
    signal: requestSignal.signal,
  }).then(async (response): Promise<TResponse> => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  });

  try {
    return requestSignal.timeoutPromise === null
      ? await requestPromise
      : await Promise.race([requestPromise, requestSignal.timeoutPromise]);
  } finally {
    requestSignal.cleanup();
  }
};

export const radioBrowserRequest = async <TResponse>(
  input: string,
  options: RadioBrowserRequestOptions = {},
): Promise<TResponse> => {
  const transports = getRadioBrowserRequestTransports(input);
  const timeoutMs = getHasProxyTransport(transports) ? RADIO_BROWSER_REQUEST_TIMEOUT_MS : null;

  let lastError: Error | null = null;

  for (const transport of transports) {
    try {
      const response = await fetchJson<TResponse>(transport, options, timeoutMs);

      notifyRadioBrowserTransportSuccess(transport);

      return response;
    } catch (error) {
      const requestError = toError(error);

      if (options.signal?.aborted) {
        throw requestError;
      }

      lastError = requestError;
    }
  }

  throw lastError ?? new Error('Radio Browser request failed');
};
