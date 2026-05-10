import { Link } from 'react-router-dom';
import { getStationPath, StationLogo } from '@entities/station';
import {
  getPlayerPrimaryButtonLabel,
  PLAYER_STATUSES,
  runPlayerPrimaryAction,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import S from './mini-player.module.css';
import { useTranslation } from '@/features/localization';
import { IconButton } from '@/shared/ui';
import { LoaderCircle, Pause, Play, RotateCw, Square } from 'lucide-react';
import { useResponsive } from '@/app/providers/responsive';
import { MiniPlayerVolume } from './mini-player-volume';

export const MiniPlayer = () => {
  const t = useTranslation();

  const { currentStation, playerStatus, isReconnectSuggested, isLoading, volume } = usePlayerUiState();
  const { isDesktop } = useResponsive();

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

  const primaryButtonLabel = getPlayerPrimaryButtonLabel({
    status: playerStatus,
    isReconnectSuggested,
    t,
  });

  const renderPrimaryIcon = () => {
    if (playerStatus === PLAYER_STATUSES.PLAYING) {
      return <Pause size={18} aria-hidden="true" />;
    }

    if (playerStatus === PLAYER_STATUSES.LOADING || playerStatus === PLAYER_STATUSES.BUFFERING) {
      return <LoaderCircle className={S.spinIcon} size={18} aria-hidden="true" />;
    }

    if (playerStatus === PLAYER_STATUSES.ERROR || isReconnectSuggested) {
      return <RotateCw size={18} aria-hidden="true" />;
    }

    return <Play size={18} aria-hidden="true" />;
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
        <IconButton size="m" onClick={handleTogglePlay} disabled={isLoading} aria-label={primaryButtonLabel}>
          {renderPrimaryIcon()}
        </IconButton>

        <IconButton size="m" onClick={actions.stop} aria-label={t.miniPlayer.stop}>
          <Square size={17} aria-hidden="true" />
        </IconButton>
      </div>

      {isDesktop && <MiniPlayerVolume volume={volume} onVolumeChange={actions.setVolume} label={t.miniPlayer.volume} />}
    </div>
  );
};
