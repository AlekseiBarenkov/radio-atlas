export class GoogleDriveRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Google Drive request failed: ${status}`);
    this.name = 'GoogleDriveRequestError';
    this.status = status;
  }
}

export const isGoogleDriveAuthError = (error: unknown): boolean => {
  return error instanceof GoogleDriveRequestError && (error.status === 401 || error.status === 403);
};

const buildHeaders = (accessToken: string, headers?: HeadersInit): Headers => {
  const nextHeaders = new Headers(headers);

  nextHeaders.set('Authorization', `Bearer ${accessToken}`);

  return nextHeaders;
};

export const googleDriveRequest = async <TResponse>(
  accessToken: string,
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<TResponse> => {
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(accessToken, init.headers),
  });

  if (!response.ok) {
    throw new GoogleDriveRequestError(response.status);
  }

  return response.json() as Promise<TResponse>;
};

export const googleDriveRequestNoContent = async (
  accessToken: string,
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<void> => {
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(accessToken, init.headers),
  });

  if (!response.ok) {
    throw new GoogleDriveRequestError(response.status);
  }
};
