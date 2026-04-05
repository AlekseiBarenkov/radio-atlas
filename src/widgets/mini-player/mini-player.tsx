import { Link } from 'react-router-dom';
import { getStationPath } from '@entities/station';
import { getLastPlayedStation, usePlayerHistory } from '@features/player-history';
import {
  getPlayerPrimaryButtonLabel,
  getPlayerStatusMessage,
  runPlayerPrimaryAction,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import S from './mini-player.module.css';

export const MiniPlayer = () => {
  const { currentStation, playerStatus, errorMessage, isReconnectSuggested, isIdle, isLoading } = usePlayerUiState();
  const { stations } = usePlayerHistory();

  const actions = usePlayerActions();

  const statusMessage = getPlayerStatusMessage({
    status: playerStatus,
    isReconnectSuggested,
    errorMessage,
  });

  const lastPlayedStation = getLastPlayedStation(stations);
  const currentStationPath = currentStation ? getStationPath(currentStation.stationuuid) : null;

  const handleTogglePlay = () => {
    runPlayerPrimaryAction({
      status: playerStatus,
      isReconnectSuggested,
      currentStation,
      actions,
    });
  };

  const handleContinueListening = () => {
    if (!lastPlayedStation) {
      return;
    }

    actions.playStation(lastPlayedStation);
  };

  return (
    <div className={S.player}>
      <div className={S.info}>
        <div className={S.title}>
          {currentStation && currentStationPath ? (
            <Link to={currentStationPath}>{currentStation.name}</Link>
          ) : (
            'Ничего не играет'
          )}
        </div>

        <div className={S.subtitle}>
          {currentStation
            ? `${currentStation.country || 'Unknown country'} • ${currentStation.language || 'Unknown language'}`
            : lastPlayedStation
              ? `Продолжить: ${lastPlayedStation.name}`
              : 'Выберите радиостанцию'}
        </div>

        {statusMessage.tone === 'info' && <div className={S.status}>{statusMessage.text}</div>}
        {statusMessage.tone === 'error' && <div className={S.error}>{statusMessage.text}</div>}
      </div>

      <div className={S.controls}>
        {isIdle && lastPlayedStation ? (
          <button className={S.button} type="button" onClick={handleContinueListening}>
            Continue listening
          </button>
        ) : (
          <button className={S.button} type="button" onClick={handleTogglePlay} disabled={isIdle || isLoading}>
            {getPlayerPrimaryButtonLabel({
              status: playerStatus,
              isReconnectSuggested,
            })}
          </button>
        )}

        <button className={S.secondaryButton} type="button" onClick={actions.stop} disabled={isIdle}>
          Stop
        </button>
      </div>
    </div>
  );
};
