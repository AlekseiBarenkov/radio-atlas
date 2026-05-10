import {
  buildProxyStreamUrl,
  getActiveProxies,
  PLAYBACK_START_TIMEOUT_MS,
  SAME_SOURCE_RETRY_LIMIT,
  STABLE_PLAYBACK_MS,
  usePlayerProxyStore,
  type PlaybackFailReason,
} from '@features/player-proxy';
import type { PlaybackSource } from './player-runtime-types';

type PlaybackFallbackResult =
  | {
      type: 'retry-current-source';
      streamUrl: string;
    }
  | {
      type: 'switch-source';
      streamUrl: string;
    }
  | {
      type: 'error';
    };

type PlayerProxyFallbackController = {
  start: (streamUrl: string) => string | null;
  markPlaying: () => void;
  getFailReason: () => PlaybackFailReason;
  scheduleStartupTimeout: () => void;
  handleFailure: (reason: PlaybackFailReason) => PlaybackFallbackResult;
  reset: () => void;
};

type PlayerProxyFallbackControllerParams = {
  getRequestId: () => number;
  isActualRequest: (requestId: number) => boolean;
  onStartupTimeout: () => void;
};

const createPlaybackSources = (streamUrl: string): PlaybackSource[] => {
  const activeProxies = getActiveProxies(usePlayerProxyStore.getState().proxies);

  const proxySources = activeProxies.map((proxy) => ({
    streamUrl: buildProxyStreamUrl(proxy, streamUrl),
    proxyId: proxy.id,
  }));

  return [
    {
      streamUrl,
      proxyId: null,
    },
    ...proxySources,
  ];
};

export const createPlayerProxyFallbackController = (
  params: PlayerProxyFallbackControllerParams,
): PlayerProxyFallbackController => {
  let playbackSources: PlaybackSource[] = [];
  let activeSourceIndex = 0;
  let hasStartedPlaying = false;
  let sameSourceRetryCount = 0;
  let playbackStartTimeout: number | null = null;
  let stablePlaybackTimeout: number | null = null;
  let isStablePlaybackRecorded = false;

  const syncActiveProxy = () => {
    const source = getActiveSource();

    usePlayerProxyStore.getState().actions.setActiveProxyId(source?.proxyId ?? null);
  };

  const clearPlaybackStartTimeout = () => {
    if (playbackStartTimeout === null) {
      return;
    }

    window.clearTimeout(playbackStartTimeout);
    playbackStartTimeout = null;
  };

  const clearStablePlaybackTimeout = () => {
    if (stablePlaybackTimeout === null) {
      return;
    }

    window.clearTimeout(stablePlaybackTimeout);
    stablePlaybackTimeout = null;
  };

  const clearTimeouts = () => {
    clearPlaybackStartTimeout();
    clearStablePlaybackTimeout();
  };

  const getActiveSource = (): PlaybackSource | null => {
    return playbackSources[activeSourceIndex] ?? null;
  };

  const markActiveProxySuccess = () => {
    const source = getActiveSource();

    if (!source || source.proxyId === null) {
      return;
    }

    usePlayerProxyStore.getState().actions.markProxySuccess(source.proxyId);
  };

  const markActiveProxyFailure = () => {
    const source = getActiveSource();

    if (!source || source.proxyId === null) {
      return;
    }

    usePlayerProxyStore.getState().actions.markProxyFailure(source.proxyId);
  };

  const schedulePlaybackStartTimeout = () => {
    clearPlaybackStartTimeout();

    const requestId = params.getRequestId();

    playbackStartTimeout = window.setTimeout(() => {
      playbackStartTimeout = null;

      if (!params.isActualRequest(requestId)) {
        return;
      }

      if (hasStartedPlaying) {
        return;
      }

      params.onStartupTimeout();
    }, PLAYBACK_START_TIMEOUT_MS);
  };

  const switchToNextSource = (): PlaybackFallbackResult => {
    const nextSource = playbackSources[activeSourceIndex + 1];

    if (!nextSource) {
      return {
        type: 'error',
      };
    }

    activeSourceIndex += 1;
    syncActiveProxy();
    hasStartedPlaying = false;
    sameSourceRetryCount = 0;
    isStablePlaybackRecorded = false;

    clearTimeouts();

    return {
      type: 'switch-source',
      streamUrl: nextSource.streamUrl,
    };
  };

  return {
    start: (streamUrl) => {
      clearTimeouts();

      playbackSources = createPlaybackSources(streamUrl);
      activeSourceIndex = 0;
      hasStartedPlaying = false;
      sameSourceRetryCount = 0;
      isStablePlaybackRecorded = false;

      const source = getActiveSource();

      if (!source) {
        return null;
      }

      syncActiveProxy();

      return source.streamUrl;
    },

    markPlaying: () => {
      clearPlaybackStartTimeout();

      hasStartedPlaying = true;
      sameSourceRetryCount = 0;

      if (isStablePlaybackRecorded) {
        return;
      }

      clearStablePlaybackTimeout();

      const requestId = params.getRequestId();

      stablePlaybackTimeout = window.setTimeout(() => {
        stablePlaybackTimeout = null;

        if (!params.isActualRequest(requestId)) {
          return;
        }

        isStablePlaybackRecorded = true;
        markActiveProxySuccess();
      }, STABLE_PLAYBACK_MS);
    },

    getFailReason: () => {
      return hasStartedPlaying ? 'runtime-interruption' : 'startup-failed';
    },

    handleFailure: (reason) => {
      clearTimeouts();

      if (reason === 'runtime-interruption' && sameSourceRetryCount < SAME_SOURCE_RETRY_LIMIT) {
        sameSourceRetryCount += 1;
        isStablePlaybackRecorded = false;

        const source = getActiveSource();

        if (!source) {
          return {
            type: 'error',
          };
        }

        hasStartedPlaying = false;

        return {
          type: 'retry-current-source',
          streamUrl: source.streamUrl,
        };
      }

      markActiveProxyFailure();

      return switchToNextSource();
    },

    scheduleStartupTimeout: () => {
      schedulePlaybackStartTimeout();
    },

    reset: () => {
      usePlayerProxyStore.getState().actions.setActiveProxyId(null);
      clearTimeouts();
      playbackSources = [];
      activeSourceIndex = 0;
      hasStartedPlaying = false;
      sameSourceRetryCount = 0;
      isStablePlaybackRecorded = false;
    },
  };
};
