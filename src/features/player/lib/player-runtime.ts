import { usePlayerStore } from '@features/player/model/player-store';
import { PLAYER_STATUSES, type PlayerStatus } from '@features/player/model/types';
import { BUFFERING_RECONNECT_DELAY_MS } from '@shared/config/player';
import { getStationStreamUrl } from './get-station-stream-url';

type PlayerRuntime = {
  destroy: () => void;
};

type PlaybackGuard = {
  next: () => number;
  current: () => number;
  isActual: (requestId: number) => boolean;
};

const createPlaybackGuard = (): PlaybackGuard => {
  let activeRequestId = 0;

  return {
    next: () => {
      activeRequestId += 1;

      return activeRequestId;
    },
    current: () => {
      return activeRequestId;
    },
    isActual: (requestId) => {
      return requestId === activeRequestId;
    },
  };
};

const shouldPlayByStatus = (status: PlayerStatus): boolean => {
  return (
    status === PLAYER_STATUSES.LOADING || status === PLAYER_STATUSES.BUFFERING || status === PLAYER_STATUSES.PLAYING
  );
};

const getPlaybackErrorMessage = (stationName: string): string => {
  return `Не удалось воспроизвести станцию "${stationName}". Поток недоступен или не поддерживается браузером.`;
};

const getMissingStreamUrlMessage = (stationName: string): string => {
  return `У станции "${stationName}" отсутствует ссылка на поток.`;
};

const resetAudioElement = (audio: HTMLAudioElement) => {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
};

const setAudioSource = (audio: HTMLAudioElement, streamUrl: string) => {
  audio.src = streamUrl;
};

export const createPlayerRuntime = (): PlayerRuntime => {
  const audio = new Audio();
  const playbackGuard = createPlaybackGuard();

  let reconnectSuggestionTimeout: number | null = null;

  audio.preload = 'none';

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

  const resetPlayback = () => {
    playbackGuard.next();
    clearReconnectSuggestion();
    resetAudioElement(audio);
  };

  const replaceAudioSource = (streamUrl: string) => {
    resetPlayback();
    setAudioSource(audio, streamUrl);
  };

  const syncPlaying = () => {
    clearReconnectSuggestion();
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
    const { currentStation, actions } = usePlayerStore.getState();

    clearReconnectSuggestion();

    if (!currentStation) {
      actions.setError('Ошибка воспроизведения потока.');

      return;
    }

    actions.setError(getPlaybackErrorMessage(currentStation.name));
  };

  const playCurrentSource = (stationId: string, stationName: string) => {
    const requestId = playbackGuard.current();

    audio.play().catch(() => {
      const { currentStation, actions } = usePlayerStore.getState();

      if (!playbackGuard.isActual(requestId)) {
        return;
      }

      if (!currentStation || currentStation.stationuuid !== stationId) {
        return;
      }

      actions.setError(getPlaybackErrorMessage(stationName));
    });
  };

  const handleStoreChange = (
    state: ReturnType<typeof usePlayerStore.getState>,
    prevState: ReturnType<typeof usePlayerStore.getState>,
  ) => {
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
      actions.setError(getMissingStreamUrlMessage(currentStation.name));

      return;
    }

    if (isStationChanged || shouldReconnectCurrentStation) {
      replaceAudioSource(streamUrl);
    }

    if (status === PLAYER_STATUSES.PAUSED) {
      audio.pause();

      return;
    }

    if (!shouldPlayByStatus(status)) {
      return;
    }

    playCurrentSource(currentStation.stationuuid, currentStation.name);
  };

  audio.addEventListener('playing', syncPlaying);
  audio.addEventListener('pause', syncPaused);
  audio.addEventListener('waiting', syncBuffering);
  audio.addEventListener('loadstart', syncLoading);
  audio.addEventListener('error', syncError);

  const unsubscribe = usePlayerStore.subscribe(handleStoreChange);

  return {
    destroy: () => {
      resetPlayback();
      unsubscribe();

      audio.removeEventListener('playing', syncPlaying);
      audio.removeEventListener('pause', syncPaused);
      audio.removeEventListener('waiting', syncBuffering);
      audio.removeEventListener('loadstart', syncLoading);
      audio.removeEventListener('error', syncError);
    },
  };
};
