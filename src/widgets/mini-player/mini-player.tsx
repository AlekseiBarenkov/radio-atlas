import { Link } from 'react-router-dom';
import { getStationPath, StationLogo } from '@entities/station';
import { getLastPlayedStation, usePlayerHistory } from '@features/player-history';
import {
  getPlayerPrimaryButtonLabel,
  getPlayerStatusMessage,
  runPlayerPrimaryAction,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import S from './mini-player.module.css';
import { useTranslation } from '@/features/localization';
import { Button } from '@/shared/ui';

export const MiniPlayer = () => {
  const t = useTranslation();

  const { currentStation, playerStatus, errorMessage, isReconnectSuggested, isIdle, isLoading } = usePlayerUiState();
  const { stations } = usePlayerHistory();

  const actions = usePlayerActions();

  const statusMessage = getPlayerStatusMessage({
    status: playerStatus,
    isReconnectSuggested,
    errorMessage,
    t,
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
      {currentStation && (
        <div className={S.logoWrapper} data-status={playerStatus}>
          <StationLogo station={currentStation} size="mini" />
        </div>
      )}

      <div className={S.info}>
        <div className={S.title}>
          {currentStation && currentStationPath ? (
            <Link to={currentStationPath}>{currentStation.name}</Link>
          ) : (
            t.miniPlayer.emptyTitle
          )}
        </div>

        <div className={S.subtitle}>
          {currentStation
            ? `${currentStation.country || t.common.unknownCountry} • ${currentStation.language || t.common.unknownLanguage}`
            : lastPlayedStation
              ? `${t.miniPlayer.continuePrefix}: ${lastPlayedStation.name}`
              : t.miniPlayer.chooseStation}
        </div>

        {statusMessage.tone === 'info' && <div className={S.status}>{statusMessage.text}</div>}
        {statusMessage.tone === 'error' && <div className={S.error}>{statusMessage.text}</div>}
      </div>

      <div className={S.controls}>
        <Button
          onClick={isIdle && lastPlayedStation ? handleContinueListening : handleTogglePlay}
          disabled={(!lastPlayedStation && isIdle) || isLoading}
        >
          {isIdle && lastPlayedStation
            ? t.miniPlayer.continueListening
            : getPlayerPrimaryButtonLabel({
                status: playerStatus,
                isReconnectSuggested,
                t,
              })}
        </Button>

        <Button variant="secondary" onClick={actions.stop} disabled={isIdle}>
          {t.miniPlayer.stop}
        </Button>
      </div>
    </div>
  );
};
