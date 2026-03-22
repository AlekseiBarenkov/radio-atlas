import { useEffect, useState } from 'react';
import {
  PLAYER_STATUSES,
  useCurrentStation,
  usePlayerActions,
  usePlayerError,
  usePlayerStatus,
} from '@features/player';
import type { PlayerStatus } from '@features/player';
import S from './mini-player.module.css';
import { BUFFERING_RECONNECT_DELAY_MS } from '@/shared/config/player';

const getPrimaryButtonLabel = (playerStatus: PlayerStatus, isReconnectSuggested: boolean): string => {
  if (playerStatus === PLAYER_STATUSES.PLAYING) {
    return 'Pause';
  }

  if (playerStatus === PLAYER_STATUSES.BUFFERING) {
    return isReconnectSuggested ? 'Reconnect' : 'Buffering...';
  }

  if (playerStatus === PLAYER_STATUSES.ERROR) {
    return 'Retry';
  }

  if (playerStatus === PLAYER_STATUSES.PAUSED) {
    return 'Resume';
  }

  return 'Play';
};

export const MiniPlayer = () => {
  const currentStation = useCurrentStation();
  const playerStatus = usePlayerStatus();
  const errorMessage = usePlayerError();
  const { pause, resume, restartCurrentStation, stop } = usePlayerActions();

  const [isReconnectSuggested, setIsReconnectSuggested] = useState(false);

  const isIdle = !currentStation;
  const isPlaying = playerStatus === PLAYER_STATUSES.PLAYING;
  const isLoading = playerStatus === PLAYER_STATUSES.LOADING;
  const isBuffering = playerStatus === PLAYER_STATUSES.BUFFERING;
  const isPaused = playerStatus === PLAYER_STATUSES.PAUSED;
  const isError = playerStatus === PLAYER_STATUSES.ERROR;

  useEffect(() => {
    if (!isBuffering) {
      setIsReconnectSuggested(false);

      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsReconnectSuggested(true);
    }, BUFFERING_RECONNECT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isBuffering, currentStation?.stationuuid]);

  const handleTogglePlay = () => {
    if (!currentStation) {
      return;
    }

    if (isPlaying) {
      pause();

      return;
    }

    if (isPaused) {
      resume();

      return;
    }

    if (isError) {
      restartCurrentStation();

      return;
    }

    if (isBuffering) {
      if (isReconnectSuggested) {
        restartCurrentStation();
      }

      return;
    }

    resume();
  };

  return (
    <div className={S.player}>
      <div className={S.info}>
        <div className={S.title}>{currentStation ? currentStation.name : 'Ничего не играет'}</div>

        <div className={S.subtitle}>
          {currentStation
            ? `${currentStation.country || 'Unknown country'} • ${currentStation.language || 'Unknown language'}`
            : 'Выберите радиостанцию'}
        </div>

        {isLoading && <div className={S.status}>Подключение к станции...</div>}
        {isBuffering && !isReconnectSuggested && <div className={S.status}>Буферизация потока...</div>}
        {isBuffering && isReconnectSuggested && (
          <div className={S.status}>Поток долго буферизуется. Попробуйте переподключить.</div>
        )}
        {isPaused && <div className={S.status}>Пауза</div>}
        {isError && <div className={S.error}>{errorMessage ?? 'Ошибка воспроизведения'}</div>}
      </div>

      <div className={S.controls}>
        <button className={S.button} type="button" onClick={handleTogglePlay} disabled={isIdle || isLoading}>
          {getPrimaryButtonLabel(playerStatus, isReconnectSuggested)}
        </button>

        <button className={S.secondaryButton} type="button" onClick={stop} disabled={isIdle}>
          Stop
        </button>
      </div>
    </div>
  );
};
