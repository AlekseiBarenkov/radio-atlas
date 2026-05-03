import { Link } from 'react-router-dom';
import { getStationPath, StationLogo } from '@entities/station';
import {
  getPlayerPrimaryButtonLabel,
  runPlayerPrimaryAction,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import S from './mini-player.module.css';
import { useTranslation } from '@/features/localization';
import { Button } from '@/shared/ui';

export const MiniPlayer = () => {
  const t = useTranslation();

  const { currentStation, playerStatus, isReconnectSuggested, isLoading } = usePlayerUiState();

  const actions = usePlayerActions();

  if (!currentStation) {
    return null;
  }

  const currentStationPath = getStationPath(currentStation.stationuuid);

  const handleTogglePlay = () => {
    runPlayerPrimaryAction({
      status: playerStatus,
      isReconnectSuggested,
      currentStation,
      actions,
    });
  };

  return (
    <div className={S.player}>
      <div className={S.logoWrapper} data-status={playerStatus}>
        <StationLogo station={currentStation} size="mini" />
      </div>

      <div className={S.info}>
        <div className={S.title}>
          <Link to={currentStationPath}>{currentStation.name}</Link>
        </div>

        <div className={S.subtitle}>
          {`${currentStation.country || t.common.unknownCountry} • ${currentStation.language || t.common.unknownLanguage}`}
        </div>
      </div>

      <div className={S.controls}>
        <Button onClick={handleTogglePlay} disabled={isLoading}>
          {getPlayerPrimaryButtonLabel({
            status: playerStatus,
            isReconnectSuggested,
            t,
          })}
        </Button>

        <Button variant="secondary" onClick={actions.stop}>
          {t.miniPlayer.stop}
        </Button>
      </div>
    </div>
  );
};
