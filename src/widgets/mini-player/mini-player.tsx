import {
  useCurrentStation,
  usePlayerActions,
  usePlayerError,
  usePlayerStatus,
  PLAYER_STATUSES,
} from '@features/player';
import S from './mini-player.module.css';

export const MiniPlayer = () => {
  const currentStation = useCurrentStation();
  const playerStatus = usePlayerStatus();
  const errorMessage = usePlayerError();
  const { pause, resume, stop } = usePlayerActions();

  const isIdle = !currentStation;
  const isPlaying = playerStatus === PLAYER_STATUSES.PLAYING;
  const isLoading = playerStatus === PLAYER_STATUSES.LOADING;
  const isPaused = playerStatus === PLAYER_STATUSES.PAUSED;
  const isError = playerStatus === PLAYER_STATUSES.ERROR;

  const handleTogglePlay = () => {
    if (!currentStation) {
      return;
    }

    if (isPlaying) {
      pause();
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
        {isPaused && <div className={S.status}>Пауза</div>}
        {isError && <div className={S.error}>{errorMessage ?? 'Ошибка воспроизведения'}</div>}
      </div>

      <div className={S.controls}>
        <button className={S.button} type="button" onClick={handleTogglePlay} disabled={isIdle}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button className={S.secondaryButton} type="button" onClick={stop} disabled={isIdle}>
          Stop
        </button>
      </div>
    </div>
  );
};
