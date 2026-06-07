export class YandexDiskRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Yandex Disk request failed: ${status}`);
    this.name = 'YandexDiskRequestError';
    this.status = status;
  }
}

export const isYandexDiskAuthError = (error: unknown): boolean => {
  return error instanceof YandexDiskRequestError && (error.status === 401 || error.status === 403);
};

export const isYandexDiskNotFoundError = (error: unknown): boolean => {
  return error instanceof YandexDiskRequestError && error.status === 404;
};

const buildHeaders = (accessToken: string, headers?: HeadersInit): Headers => {
  const nextHeaders = new Headers(headers);

  nextHeaders.set('Authorization', `OAuth ${accessToken}`);

  return nextHeaders;
};

export const yandexDiskRequest = async <TResponse>(
  accessToken: string,
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<TResponse> => {
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(accessToken, init.headers),
  });

  if (!response.ok) {
    throw new YandexDiskRequestError(response.status);
  }

  return response.json() as Promise<TResponse>;
};
