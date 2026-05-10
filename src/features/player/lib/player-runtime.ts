import { getStationStreamUrl } from '@entities/station';
import { usePlayerStore } from '@features/player/model/player-store';
import { PLAYER_STATUSES, type PlayerStatus } from '@features/player/model/types';
import type { PlaybackFailReason } from '@features/player-proxy';
import { BUFFERING_RECONNECT_DELAY_MS } from '@shared/config/player';
import { createPlayerAudioController } from './player-audio-controller';
import { createPlaybackGuard } from './player-playback-guard';
import { createPlayerProxyFallbackController } from './player-proxy-fallback-controller';
import type { PlayerRuntime } from './player-runtime-types';

const shouldPlayByStatus = (status: PlayerStatus): boolean => {
  return (
    status === PLAYER_STATUSES.LOADING || status === PLAYER_STATUSES.BUFFERING || status === PLAYER_STATUSES.PLAYING
  );
};

const getPlaybackErrorMessage = (): string => {
  return 'playback-error';
};

export const createPlayerRuntime = (): PlayerRuntime => {
  const audioController = createPlayerAudioController({
    volume: usePlayerStore.getState().volume,
  });
  const playbackGuard = createPlaybackGuard();

  let reconnectSuggestionTimeout: number | null = null;

  const setStatusSafe = (status: PlayerStatus) => {
    const { status: currentStatus, actions } = usePlayerStore.getState();

    if (currentStatus === status) {
      return;
    }

    actions.setStatus(status);
  };

  const clearReconnectSuggestionTimeout = () => {
    if (reconnectSuggestionTimeout === null) {
      return;
    }

    window.clearTimeout(reconnectSuggestionTimeout);
    reconnectSuggestionTimeout = null;
  };

  const resetReconnectSuggestionState = () => {
    const { isReconnectSuggested, actions } = usePlayerStore.getState();

    if (!isReconnectSuggested) {
      return;
    }

    actions.setReconnectSuggested(false);
  };

  const clearReconnectSuggestion = () => {
    clearReconnectSuggestionTimeout();
    resetReconnectSuggestionState();
  };

  const fallbackController = createPlayerProxyFallbackController({
    getRequestId: playbackGuard.current,
    isActualRequest: playbackGuard.isActual,
    onStartupTimeout: () => {
      handlePlaybackFailure('startup-failed');
    },
  });

  const resetPlayback = () => {
    playbackGuard.next();
    clearReconnectSuggestion();
    fallbackController.reset();
    audioController.reset();
  };

  const replaceAudioSource = (streamUrl: string) => {
    playbackGuard.next();
    clearReconnectSuggestion();
    audioController.reset();
    audioController.setSource(streamUrl);
    fallbackController.scheduleStartupTimeout();
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

      handlePlaybackFailure('startup-failed');
    });
  };

  const handlePlaybackFailure = (reason: PlaybackFailReason) => {
    const { currentStation, actions } = usePlayerStore.getState();

    clearReconnectSuggestion();

    if (!currentStation) {
      actions.setError(getPlaybackErrorMessage());

      return;
    }

    const result = fallbackController.handleFailure(reason);

    if (result.type === 'error') {
      actions.setError(getPlaybackErrorMessage());

      return;
    }

    replaceAudioSource(result.streamUrl);
    setStatusSafe(PLAYER_STATUSES.LOADING);
    playCurrentSource(currentStation.stationuuid);
  };

  const syncPlaying = () => {
    clearReconnectSuggestion();
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

    clearReconnectSuggestion();
    setStatusSafe(PLAYER_STATUSES.PAUSED);
  };

  const scheduleReconnectSuggestion = () => {
    if (reconnectSuggestionTimeout !== null) {
      return;
    }

    const requestId = playbackGuard.current();

    reconnectSuggestionTimeout = window.setTimeout(() => {
      reconnectSuggestionTimeout = null;

      if (!playbackGuard.isActual(requestId)) {
        return;
      }

      const {
        currentStation: activeStation,
        status,
        isReconnectSuggested,
        actions: latestActions,
      } = usePlayerStore.getState();

      if (!activeStation) {
        return;
      }

      if (status !== PLAYER_STATUSES.BUFFERING || isReconnectSuggested) {
        return;
      }

      latestActions.setReconnectSuggested(true);
    }, BUFFERING_RECONNECT_DELAY_MS);
  };

  const syncBuffering = () => {
    const { currentStation } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    setStatusSafe(PLAYER_STATUSES.BUFFERING);
    scheduleReconnectSuggestion();
  };

  const syncLoading = () => {
    const { currentStation } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    clearReconnectSuggestion();
    setStatusSafe(PLAYER_STATUSES.LOADING);
  };

  const syncError = () => {
    handlePlaybackFailure(fallbackController.getFailReason());
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
