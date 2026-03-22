import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@features/player/model/player-store';
import { PLAYER_STATUSES, type PlayerStatus } from '@features/player/model/types';
import { getStationStreamUrl } from '@features/player/lib/get-station-stream-url';

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

export const PlayerAudioBridge = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const handlePlaying = () => {
      const { actions } = usePlayerStore.getState();

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

      actions.setStatus(PLAYER_STATUSES.PAUSED);
    };

    const handleWaiting = () => {
      const { currentStation, actions } = usePlayerStore.getState();

      if (!currentStation) {
        return;
      }

      actions.setStatus(PLAYER_STATUSES.BUFFERING);
    };

    const handleLoadStart = () => {
      const { currentStation, actions } = usePlayerStore.getState();

      if (!currentStation) {
        return;
      }

      actions.setStatus(PLAYER_STATUSES.LOADING);
    };

    const handleError = () => {
      const { currentStation, actions } = usePlayerStore.getState();

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
      const currentAudio = audioRef.current;

      if (!currentAudio) {
        return;
      }

      const { currentStation, status, actions, reconnectAt } = state;
      const prevStation = prevState.currentStation;
      const prevReconnectAt = prevState.reconnectAt;

      const isStationChanged = currentStation?.stationuuid !== prevStation?.stationuuid;
      const shouldReconnectCurrentStation =
        Boolean(currentStation) && reconnectAt !== null && reconnectAt !== prevReconnectAt;

      if (!currentStation) {
        resetAudioElement(currentAudio);

        return;
      }

      const streamUrl = getStationStreamUrl(currentStation);

      if (!streamUrl) {
        resetAudioElement(currentAudio);
        actions.setError(getMissingStreamUrlMessage(currentStation.name));

        return;
      }

      if (isStationChanged || shouldReconnectCurrentStation) {
        resetAudioElement(currentAudio);
        setAudioSource(currentAudio, streamUrl);
      }

      if (status === PLAYER_STATUSES.PAUSED) {
        currentAudio.pause();

        return;
      }

      if (!shouldPlayByStatus(status)) {
        return;
      }

      currentAudio.play().catch(() => {
        actions.setError(getPlaybackErrorMessage(currentStation.name));
      });
    });

    return () => {
      unsubscribe();

      resetAudioElement(audio);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  return null;
};
