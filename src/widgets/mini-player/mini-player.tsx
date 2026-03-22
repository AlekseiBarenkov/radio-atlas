import {
  getPlayerPrimaryButtonLabel,
  getPlayerStatusMessage,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import S from './mini-player.module.css';

export const MiniPlayer = () => {
  const {
    currentStation,
    playerStatus,
    errorMessage,
    isReconnectSuggested,
    isIdle,
    isLoading,
    isPlaying,
    isPaused,
    isBuffering,
    isError,
  } = usePlayerUiState();

  const { pause, resume, restartCurrentStation, stop } = usePlayerActions();

  const statusMessage = getPlayerStatusMessage({
    status: playerStatus,
    isReconnectSuggested,
    errorMessage,
  });

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

        {statusMessage.tone === 'info' && <div className={S.status}>{statusMessage.text}</div>}
        {statusMessage.tone === 'error' && <div className={S.error}>{statusMessage.text}</div>}
      </div>

      <div className={S.controls}>
        <button className={S.button} type="button" onClick={handleTogglePlay} disabled={isIdle || isLoading}>
          {getPlayerPrimaryButtonLabel({
            status: playerStatus,
            isReconnectSuggested,
          })}
        </button>

        <button className={S.secondaryButton} type="button" onClick={stop} disabled={isIdle}>
          Stop
        </button>
      </div>
    </div>
  );
};
