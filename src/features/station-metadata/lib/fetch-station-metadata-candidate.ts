import type { StationMetadataCandidateFetchResult, StationMetadataCandidateRequest } from '../model/types';

const STATION_METADATA_FETCH_TIMEOUT_MS = 8_000;

type FailedFetchStatus = 'not-found' | 'temporary-failure';

const getFailedFetchStatus = (status: number): FailedFetchStatus => {
  return status >= 500 ? 'temporary-failure' : 'not-found';
};

export const fetchStationMetadataCandidate = async (
  request: StationMetadataCandidateRequest,
  streamUrl: string,
): Promise<StationMetadataCandidateFetchResult> => {
  if (!navigator.onLine) {
    return {
      status: 'temporary-failure',
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, STATION_METADATA_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(request.transport.requestUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json, text/plain, text/html, */*',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        status: getFailedFetchStatus(response.status),
      };
    }

    return {
      status: 'success',
      input: {
        candidateUrl: request.candidateUrl,
        contentType: response.headers.get('content-type') ?? '',
        body: await response.text(),
        streamUrl,
      },
    };
  } catch {
    return {
      status: 'temporary-failure',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};
