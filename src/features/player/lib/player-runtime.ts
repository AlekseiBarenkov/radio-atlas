import { getStationStreamUrl } from '@entities/station';
import { usePlayerStore } from '@features/player/model/player-store';
import { PLAYER_STATUSES, type PlayerStatus } from '@features/player/model/types';
import { BUFFERING_AUTO_RECONNECT_DELAY_MS } from '@shared/config/player';
import { createPlayerAudioController } from './player-audio-controller';
import { createPlayerDelayedReconnectController } from './player-delayed-reconnect-controller';
import { createPlaybackGuard } from './player-playback-guard';
import { createPlayerProxyFallbackController } from './player-proxy-fallback-controller';
import type { PlayerRuntime } from './player-runtime-types';
import { createPlayerMediaSessionController } from './player-media-session-controller';

const shouldPlayByStatus = (status: PlayerStatus): boolean => {
  return status === PLAYER_STATUSES.LOADING;
};

const getPlaybackErrorMessage = (): string => {
  return 'playback-error';
};

export const createPlayerRuntime = (): PlayerRuntime => {
  const playbackGuard = createPlaybackGuard();

  const audioController = createPlayerAudioController({
    volume: usePlayerStore.getState().volume,
  });

  const fallbackController = createPlayerProxyFallbackController();

  const mediaSessionController = createPlayerMediaSessionController({
    onPlay: () => {
      usePlayerStore.getState().actions.resume();
    },
    onPause: () => {
      usePlayerStore.getState().actions.pause();
    },
    onStop: () => {
      usePlayerStore.getState().actions.stop();
    },
  });

  const initialStation = usePlayerStore.getState().currentStation;

  if (initialStation) {
    mediaSessionController.setMetadata(initialStation);
    mediaSessionController.setPlaybackState('paused');
    mediaSessionController.setActionState('paused');
  }

  let hasActiveSourcePlayed = false;

  const startSourcePlayback = (sourceUrl: string, stationId: string) => {
    replaceAudioSource(sourceUrl);
    setStatusSafe(PLAYER_STATUSES.LOADING);
    playCurrentSource(stationId);
  };

  function restartActiveSource() {
    const { currentStation } = usePlayerStore.getState();
    bufferingReconnectController.clear();

    if (!currentStation) {
      return;
    }

    const sourceUrl = fallbackController.getActiveSourceUrl();

    if (!sourceUrl) {
      return;
    }

    startSourcePlayback(sourceUrl, currentStation.stationuuid);
  }

  const bufferingReconnectController = createPlayerDelayedReconnectController({
    delayMs: BUFFERING_AUTO_RECONNECT_DELAY_MS,
    getRequestId: playbackGuard.current,
    isActualRequest: playbackGuard.isActual,
    onReconnect: restartActiveSource,
  });

  const setStatusSafe = (status: PlayerStatus) => {
    const { status: currentStatus, actions } = usePlayerStore.getState();

    if (currentStatus === status) {
      return;
    }

    actions.setStatus(status);
  };

  const resetPlayback = () => {
    playbackGuard.next();
    hasActiveSourcePlayed = false;
    bufferingReconnectController.clear();
    fallbackController.reset();
    audioController.reset();
    mediaSessionController.reset();
  };

  const replaceAudioSource = (streamUrl: string) => {
    playbackGuard.next();
    hasActiveSourcePlayed = false;
    bufferingReconnectController.clear();
    audioController.setSource(streamUrl);
  };

  const suspendAudioSource = () => {
    playbackGuard.next();
    hasActiveSourcePlayed = false;
    bufferingReconnectController.clear();
    fallbackController.reset();
    audioController.pause();
    mediaSessionController.setPlaybackState('paused');
    mediaSessionController.setActionState('paused');
  };

  const playCurrentSource = (stationId: string) => {
    const requestId = playbackGuard.current();

    audioController.play().catch(() => {
      const { currentStation } = usePlayerStore.getState();

      if (!playbackGuard.isActual(requestId)) {
        return;
      }

      if (!currentStation || currentStation.stationuuid !== stationId) {
        return;
      }

      handlePlaybackFailure();
    });
  };

  const handlePlaybackFailure = () => {
    const { currentStation, actions } = usePlayerStore.getState();

    bufferingReconnectController.clear();

    if (!currentStation) {
      actions.setError(getPlaybackErrorMessage());

      return;
    }

    const sourceUrl = fallbackController.handleFailure();

    if (!sourceUrl) {
      actions.setError(getPlaybackErrorMessage());

      return;
    }

    startSourcePlayback(sourceUrl, currentStation.stationuuid);
  };

  const syncPlaying = () => {
    hasActiveSourcePlayed = true;
    bufferingReconnectController.clear();
    fallbackController.markPlaying();
    setStatusSafe(PLAYER_STATUSES.PLAYING);
    mediaSessionController.setPlaybackState('playing');
    mediaSessionController.setActionState('playing');
  };

  const syncPaused = () => {
    const { currentStation, status } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    if (status === PLAYER_STATUSES.ERROR || status === PLAYER_STATUSES.IDLE || status === PLAYER_STATUSES.LOADING) {
      return;
    }

    bufferingReconnectController.clear();
    setStatusSafe(PLAYER_STATUSES.PAUSED);
    mediaSessionController.setPlaybackState('paused');
    mediaSessionController.setActionState('paused');
  };

  const syncBuffering = () => {
    const { currentStation } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    setStatusSafe(PLAYER_STATUSES.BUFFERING);

    if (hasActiveSourcePlayed) {
      bufferingReconnectController.schedule();
    }
  };

  const syncLoading = () => {
    const { currentStation, status } = usePlayerStore.getState();

    if (!currentStation || status === PLAYER_STATUSES.PAUSED) {
      return;
    }

    setStatusSafe(PLAYER_STATUSES.LOADING);
  };

  const syncError = () => {
    handlePlaybackFailure();
  };

  const handleStoreChange = (
    state: ReturnType<typeof usePlayerStore.getState>,
    prevState: ReturnType<typeof usePlayerStore.getState>,
  ) => {
    if (state.volume !== prevState.volume) {
      audioController.setVolume(state.volume);
    }

    const { currentStation, status, actions, reconnectAt } = state;
    const prevStation = prevState.currentStation;
    const prevReconnectAt = prevState.reconnectAt;

    const isStationChanged = currentStation?.stationuuid !== prevStation?.stationuuid;
    if (currentStation && isStationChanged) {
      mediaSessionController.setMetadata(currentStation);
    }

    const shouldReconnectCurrentStation =
      Boolean(currentStation) && reconnectAt !== null && reconnectAt !== prevReconnectAt;

    if (!currentStation) {
      resetPlayback();

      return;
    }

    const streamUrl = getStationStreamUrl(currentStation);

    if (!streamUrl) {
      resetPlayback();
      actions.setError(getPlaybackErrorMessage());

      return;
    }

    const shouldResumePausedStation = prevState.status === PLAYER_STATUSES.PAUSED && status === PLAYER_STATUSES.LOADING;

    if (isStationChanged || shouldReconnectCurrentStation || shouldResumePausedStation) {
      const sourceUrl = fallbackController.start(streamUrl);

      if (!sourceUrl) {
        resetPlayback();
        actions.setError(getPlaybackErrorMessage());

        return;
      }

      startSourcePlayback(sourceUrl, currentStation.stationuuid);

      return;
    }

    if (status === PLAYER_STATUSES.PAUSED) {
      if (prevState.status !== PLAYER_STATUSES.PAUSED) {
        suspendAudioSource();
      }

      return;
    }

    if (!shouldPlayByStatus(status)) {
      return;
    }

    playCurrentSource(currentStation.stationuuid);
  };

  audioController.audio.addEventListener('playing', syncPlaying);
  audioController.audio.addEventListener('pause', syncPaused);
  audioController.audio.addEventListener('waiting', syncBuffering);
  audioController.audio.addEventListener('loadstart', syncLoading);
  audioController.audio.addEventListener('error', syncError);

  const unsubscribe = usePlayerStore.subscribe(handleStoreChange);

  return {
    destroy: () => {
      resetPlayback();
      unsubscribe();

      audioController.audio.removeEventListener('playing', syncPlaying);
      audioController.audio.removeEventListener('pause', syncPaused);
      audioController.audio.removeEventListener('waiting', syncBuffering);
      audioController.audio.removeEventListener('loadstart', syncLoading);
      audioController.audio.removeEventListener('error', syncError);
      mediaSessionController.destroy();
      audioController.destroy();
    },
  };
};
