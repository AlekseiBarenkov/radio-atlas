import {
  buildProxyStreamUrl,
  getActiveProxies,
  SAME_SOURCE_RETRY_LIMIT,
  usePlayerProxyStore,
} from '@features/player-proxy';
import type { PlaybackSource } from './player-runtime-types';

type PlayerProxyFallbackController = {
  start: (streamUrl: string) => string | null;
  getActiveSourceUrl: () => string | null;
  markPlaying: () => void;
  handleFailure: () => string | null;
  reset: () => void;
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

export const createPlayerProxyFallbackController = (): PlayerProxyFallbackController => {
  let playbackSources: PlaybackSource[] = [];
  let activeSourceIndex = 0;
  let sameSourceRetryCount = 0;

  const syncActiveProxy = () => {
    const source = getActiveSource();

    usePlayerProxyStore.getState().actions.setActiveProxyId(source?.proxyId ?? null);
  };

  const getActiveSource = (): PlaybackSource | null => {
    return playbackSources[activeSourceIndex] ?? null;
  };

  const markActiveProxyFailure = () => {
    const source = getActiveSource();

    if (!source || source.proxyId === null) {
      return;
    }
    usePlayerProxyStore.getState().actions.setProxyAvailability(source.proxyId, false);
  };

  const switchToNextSource = (): string | null => {
    const nextSource = playbackSources[activeSourceIndex + 1];

    if (!nextSource) {
      return null;
    }

    activeSourceIndex += 1;
    syncActiveProxy();
    sameSourceRetryCount = 0;

    return nextSource.streamUrl;
  };

  return {
    start: (streamUrl) => {
      playbackSources = createPlaybackSources(streamUrl);
      activeSourceIndex = 0;
      sameSourceRetryCount = 0;

      const source = getActiveSource();

      if (!source) {
        return null;
      }

      syncActiveProxy();

      return source.streamUrl;
    },

    markPlaying: () => {
      sameSourceRetryCount = 0;

      const source = getActiveSource();

      if (source?.proxyId) {
        usePlayerProxyStore.getState().actions.setProxyAvailability(source.proxyId, true);
      }
    },

    handleFailure: () => {
      if (sameSourceRetryCount < SAME_SOURCE_RETRY_LIMIT) {
        sameSourceRetryCount += 1;

        return getActiveSource()?.streamUrl ?? null;
      }

      markActiveProxyFailure();

      return switchToNextSource();
    },

    getActiveSourceUrl: () => {
      return getActiveSource()?.streamUrl ?? null;
    },

    reset: () => {
      usePlayerProxyStore.getState().actions.setActiveProxyId(null);
      playbackSources = [];
      activeSourceIndex = 0;
      sameSourceRetryCount = 0;
    },
  };
};
