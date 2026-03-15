import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@features/player/model/player-store';
import { PLAYER_STATUSES } from '@features/player/model/types';
import { getStationStreamUrl } from '@features/player/lib/get-station-stream-url';

const shouldPlayByStatus = (status: string): boolean => {
  return (
    status === PLAYER_STATUSES.LOADING || status === PLAYER_STATUSES.BUFFERING || status === PLAYER_STATUSES.PLAYING
  );
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

      if (status !== PLAYER_STATUSES.ERROR) {
        actions.setStatus(PLAYER_STATUSES.PAUSED);
      }
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
      const { actions } = usePlayerStore.getState();

      actions.setError('Ошибка воспроизведения потока.');
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

      const { currentStation, status, actions } = state;
      const prevStation = prevState.currentStation;

      const isStationChanged = currentStation?.stationuuid !== prevStation?.stationuuid;

      if (!currentStation) {
        currentAudio.pause();
        currentAudio.removeAttribute('src');
        currentAudio.load();
        return;
      }

      const streamUrl = getStationStreamUrl(currentStation);

      if (!streamUrl) {
        actions.setError('У станции отсутствует поток для воспроизведения.');
        return;
      }

      if (isStationChanged) {
        currentAudio.pause();
        currentAudio.src = streamUrl;
        currentAudio.load();

        void currentAudio.play().catch(() => {
          actions.setError('Не удалось запустить воспроизведение.');
        });

        return;
      }

      if (status === PLAYER_STATUSES.PAUSED && !currentAudio.paused) {
        currentAudio.pause();
        return;
      }

      if (shouldPlayByStatus(status) && currentAudio.paused) {
        void currentAudio.play().catch(() => {
          actions.setError('Не удалось возобновить воспроизведение.');
        });
      }
    });

    return () => {
      unsubscribe();

      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);

      audio.pause();
      audio.removeAttribute('src');
      audio.load();

      audioRef.current = null;
    };
  }, []);

  return null;
};
