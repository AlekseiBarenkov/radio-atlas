import {
  getRadioBrowserRequestTransports,
  markRadioBrowserDirectFailure,
  type RadioBrowserRequestTransport,
} from './radio-browser-api';

type RequestMethod = 'GET';

type RadioBrowserRequestOptions = {
  method?: RequestMethod;
  signal?: AbortSignal;
};

const DIRECT_REQUEST_TIMEOUT_MS = 3_000;

const createAbortError = (): DOMException => {
  return new DOMException('Request aborted', 'AbortError');
};

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error('Radio Browser request failed');
};

const createFetchSignal = (sourceSignal: AbortSignal | undefined, timeoutMs: number | null) => {
  const controller = new AbortController();
  let timeoutId: number | null = null;

  const abort = () => {
    controller.abort();
  };

  if (sourceSignal?.aborted) {
    controller.abort();
  } else {
    sourceSignal?.addEventListener('abort', abort, { once: true });
  }

  if (timeoutMs !== null) {
    timeoutId = window.setTimeout(abort, timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      sourceSignal?.removeEventListener('abort', abort);
    },
  };
};

const fetchJson = async <TResponse>(
  transport: RadioBrowserRequestTransport,
  options: RadioBrowserRequestOptions,
): Promise<TResponse> => {
  const { method = 'GET', signal } = options;
  const fetchSignal = createFetchSignal(signal, transport.type === 'direct' ? DIRECT_REQUEST_TIMEOUT_MS : null);

  try {
    const response = await fetch(transport.url, {
      method,
      signal: fetchSignal.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } finally {
    fetchSignal.cleanup();
  }
};

export const radioBrowserRequest = async <TResponse>(
  input: string,
  options: RadioBrowserRequestOptions = {},
): Promise<TResponse> => {
  let lastError: Error | null = null;

  for (const transport of getRadioBrowserRequestTransports(input)) {
    if (options.signal?.aborted) {
      throw createAbortError();
    }

    try {
      return await fetchJson<TResponse>(transport, options);
    } catch (error) {
      if (options.signal?.aborted) {
        throw createAbortError();
      }

      if (transport.type === 'direct') {
        markRadioBrowserDirectFailure();
      }

      lastError = toError(error);
    }
  }

  throw lastError ?? new Error('Radio Browser request failed');
};
