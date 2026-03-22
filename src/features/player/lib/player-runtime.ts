import { usePlayerStore } from '@features/player/model/player-store';
import { PLAYER_STATUSES, type PlayerStatus } from '@features/player/model/types';
import { getStationStreamUrl } from './get-station-stream-url';
import { BUFFERING_RECONNECT_DELAY_MS } from '@shared/config/player';

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

  const scheduleReconnectSuggestion = (requestId: number) => {
    if (reconnectSuggestionTimeout !== null) {
      return;
    }

    reconnectSuggestionTimeout = window.setTimeout(() => {
      reconnectSuggestionTimeout = null;

      if (!playbackGuard.isActual(requestId)) {
        return;
      }

      const { currentStation, status, isReconnectSuggested, actions } = usePlayerStore.getState();

      if (!currentStation) {
        return;
      }

      if (status !== PLAYER_STATUSES.BUFFERING || isReconnectSuggested) {
        return;
      }

      actions.setReconnectSuggested(true);
    }, BUFFERING_RECONNECT_DELAY_MS);
  };

  const handlePlaying = () => {
    const { actions } = usePlayerStore.getState();

    clearReconnectSuggestion();
    actions.setStatus(PLAYER_STATUSES.PLAYING);
  };

  const handlePause = () => {
    const { currentStation, status, actions } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    if (status === PLAYER_STATUSES.ERROR || status === PLAYER_STATUSES.IDLE || status === PLAYER_STATUSES.LOADING) {
      return;
    }

    clearReconnectSuggestion();
    actions.setStatus(PLAYER_STATUSES.PAUSED);
  };

  const handleWaiting = () => {
    const { currentStation, actions } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    const requestId = playbackGuard.current();

    actions.setStatus(PLAYER_STATUSES.BUFFERING);
    scheduleReconnectSuggestion(requestId);
  };

  const handleLoadStart = () => {
    const { currentStation, actions } = usePlayerStore.getState();

    if (!currentStation) {
      return;
    }

    clearReconnectSuggestion();
    actions.setStatus(PLAYER_STATUSES.LOADING);
  };

  const handleError = () => {
    const { currentStation, actions } = usePlayerStore.getState();

    clearReconnectSuggestion();

    if (!currentStation) {
      actions.setError('Ошибка воспроизведения потока.');

      return;
    }

    actions.setError(getPlaybackErrorMessage(currentStation.name));
  };

  audio.addEventListener('playing', handlePlaying);
  audio.addEventListener('pause', handlePause);
  audio.addEventListener('waiting', handleWaiting);
  audio.addEventListener('loadstart', handleLoadStart);
  audio.addEventListener('error', handleError);

  const unsubscribe = usePlayerStore.subscribe((state, prevState) => {
    const { currentStation, status, actions, reconnectAt } = state;
    const prevStation = prevState.currentStation;
    const prevReconnectAt = prevState.reconnectAt;

    const isStationChanged = currentStation?.stationuuid !== prevStation?.stationuuid;
    const shouldReconnectCurrentStation =
      Boolean(currentStation) && reconnectAt !== null && reconnectAt !== prevReconnectAt;
    console.log(12);
    if (!currentStation) {
      playbackGuard.next();
      clearReconnectSuggestion();
      resetAudioElement(audio);

      return;
    }

    const streamUrl = getStationStreamUrl(currentStation);

    if (!streamUrl) {
      playbackGuard.next();
      clearReconnectSuggestion();
      resetAudioElement(audio);
      actions.setError(getMissingStreamUrlMessage(currentStation.name));

      return;
    }

    if (isStationChanged || shouldReconnectCurrentStation) {
      playbackGuard.next();
      clearReconnectSuggestion();
      resetAudioElement(audio);
      setAudioSource(audio, streamUrl);
    }

    if (status === PLAYER_STATUSES.PAUSED) {
      audio.pause();

      return;
    }

    if (!shouldPlayByStatus(status)) {
      return;
    }

    const requestId = playbackGuard.current();
    const stationId = currentStation.stationuuid;
    const stationName = currentStation.name;

    audio.play().catch(() => {
      const { currentStation: activeStation, actions: latestActions } = usePlayerStore.getState();

      if (!playbackGuard.isActual(requestId)) {
        return;
      }

      if (!activeStation || activeStation.stationuuid !== stationId) {
        return;
      }

      latestActions.setError(getPlaybackErrorMessage(stationName));
    });
  });

  return {
    destroy: () => {
      playbackGuard.next();
      clearReconnectSuggestion();
      unsubscribe();
      console.log('destroy');
      resetAudioElement(audio);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
    },
  };
};
