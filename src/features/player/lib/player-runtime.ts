import { getStationStreamUrl } from '@entities/station';
import { usePlayerStore } from '@features/player/model/player-store';
import { PLAYER_STATUSES, type PlayerStatus } from '@features/player/model/types';
import { BUFFERING_AUTO_RECONNECT_DELAY_MS, STARTUP_AUTO_RECONNECT_DELAY_MS } from '@shared/config/player';
import { createPlayerAudioController } from './player-audio-controller';
import { createPlayerDelayedReconnectController } from './player-delayed-reconnect-controller';
import { createPlaybackGuard } from './player-playback-guard';
import { createPlayerProxyFallbackController } from './player-proxy-fallback-controller';
import type { PlayerRuntime } from './player-runtime-types';

const STARTUP_AUTO_RECONNECT_LIMIT = 1;

const shouldPlayByStatus = (status: PlayerStatus): boolean => {
  return (
    status === PLAYER_STATUSES.LOADING || status === PLAYER_STATUSES.BUFFERING || status === PLAYER_STATUSES.PLAYING
  );
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

  let startupReconnectCount = 0;

  const startSourcePlayback = (sourceUrl: string, stationId: string) => {
    replaceAudioSource(sourceUrl);
    setStatusSafe(PLAYER_STATUSES.LOADING);
    playCurrentSource(stationId);
  };

  function restartActiveSource() {
    const { currentStation } = usePlayerStore.getState();

    clearReconnectControllers();

    if (!currentStation) {
      return;
    }

    const sourceUrl = fallbackController.getActiveSourceUrl();

    if (!sourceUrl) {
      return;
    }

    startSourcePlayback(sourceUrl, currentStation.stationuuid);
  }

  function reconnectCurrentSourceAfterStartup() {
    if (startupReconnectCount >= STARTUP_AUTO_RECONNECT_LIMIT) {
      return;
    }

    startupReconnectCount += 1;
    restartActiveSource();
  }

  const bufferingReconnectController = createPlayerDelayedReconnectController({
    delayMs: BUFFERING_AUTO_RECONNECT_DELAY_MS,
    getRequestId: playbackGuard.current,
    isActualRequest: playbackGuard.isActual,
    onReconnect: restartActiveSource,
  });

  const startupReconnectController = createPlayerDelayedReconnectController({
    delayMs: STARTUP_AUTO_RECONNECT_DELAY_MS,
    getRequestId: playbackGuard.current,
    isActualRequest: playbackGuard.isActual,
    onReconnect: reconnectCurrentSourceAfterStartup,
  });

  const clearReconnectControllers = () => {
    bufferingReconnectController.clear();
    startupReconnectController.clear();
  };

  const setStatusSafe = (status: PlayerStatus) => {
    const { status: currentStatus, actions } = usePlayerStore.getState();

    if (currentStatus === status) {
      return;
    }

    actions.setStatus(status);
  };

  const resetPlayback = () => {
    playbackGuard.next();
    startupReconnectCount = 0;
    clearReconnectControllers();
    fallbackController.reset();
    audioController.reset();
  };

  const replaceAudioSource = (streamUrl: string) => {
    playbackGuard.next();
    clearReconnectControllers();
    audioController.reset();
    audioController.setSource(streamUrl);
    startupReconnectController.schedule();
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

    clearReconnectControllers();

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
    startupReconnectCount = 0;
    clearReconnectControllers();
    fallbackController.markPlaying();
    setStatusSafe(PLAYER_STATUSES.PLAYING);
  };

  const syncPaused = () => {
    const { currentStation, status } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    if (status === PLAYER_STATUSES.ERROR || status === PLAYER_STATUSES.IDLE || status === PLAYER_STATUSES.LOADING) {
      return;
    }

    clearReconnectControllers();
    setStatusSafe(PLAYER_STATUSES.PAUSED);
  };

  const syncBuffering = () => {
    const { currentStation } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    setStatusSafe(PLAYER_STATUSES.BUFFERING);
    bufferingReconnectController.schedule();
  };

  const syncLoading = () => {
    const { currentStation } = usePlayerStore.getState();

    if (!currentStation) {
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

    if (isStationChanged) {
      startupReconnectCount = 0;
    }

    if (isStationChanged || shouldReconnectCurrentStation) {
      const sourceUrl = fallbackController.start(streamUrl);

      if (!sourceUrl) {
        resetPlayback();
        actions.setError(getPlaybackErrorMessage());

        return;
      }

      replaceAudioSource(sourceUrl);
    }

    if (status === PLAYER_STATUSES.PAUSED) {
      audioController.pause();

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
      audioController.destroy();
    },
  };
};
