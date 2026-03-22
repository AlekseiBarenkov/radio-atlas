import { useMemo } from 'react';
import {
  PLAYER_STATUSES,
  useCurrentStation,
  usePlayerActions,
  usePlayerError,
  usePlayerStatus,
} from '@features/player';
import type { RadioStation } from '@entities/station/model/types';
import S from './station-card.module.css';

type StationCardProps = {
  station: RadioStation;
};

const getStationImage = (station: RadioStation): string | null => {
  const favicon = station.favicon.trim();

  return favicon.length > 0 ? favicon : null;
};

const getStationBitrateLabel = (station: RadioStation): string => {
  return station.bitrate > 0 ? String(station.bitrate) : 'unknown';
};

const getCardClassName = (isCurrentStation: boolean, hasError: boolean): string => {
  if (isCurrentStation && hasError) {
    return `${S.card} ${S.cardCurrent} ${S.cardError}`;
  }

  if (isCurrentStation) {
    return `${S.card} ${S.cardCurrent}`;
  }

  if (hasError) {
    return `${S.card} ${S.cardError}`;
  }

  return S.card;
};

export const StationCard = ({ station }: StationCardProps) => {
  const image = getStationImage(station);
  const bitrateLabel = getStationBitrateLabel(station);

  const currentStation = useCurrentStation();
  const playerStatus = usePlayerStatus();
  const playerError = usePlayerError();
  const { playStation, pause, resume } = usePlayerActions();

  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
  const hasCurrentStationError = isCurrentStation && playerStatus === PLAYER_STATUSES.ERROR && Boolean(playerError);
  const isButtonBusy =
    isCurrentStation && (playerStatus === PLAYER_STATUSES.LOADING || playerStatus === PLAYER_STATUSES.BUFFERING);

  const buttonLabel = useMemo(() => {
    if (!isCurrentStation) {
      return 'Play';
    }

    if (playerStatus === PLAYER_STATUSES.LOADING) {
      return 'Loading...';
    }

    if (playerStatus === PLAYER_STATUSES.BUFFERING) {
      return 'Buffering...';
    }

    if (playerStatus === PLAYER_STATUSES.PAUSED) {
      return 'Resume';
    }

    if (playerStatus === PLAYER_STATUSES.PLAYING) {
      return 'Pause';
    }

    return 'Play';
  }, [isCurrentStation, playerStatus]);

  const handlePlayClick = () => {
    if (isButtonBusy) {
      return;
    }

    if (!isCurrentStation) {
      playStation(station);

      return;
    }

    if (playerStatus === PLAYER_STATUSES.PLAYING) {
      pause();

      return;
    }

    if (
      playerStatus === PLAYER_STATUSES.PAUSED ||
      playerStatus === PLAYER_STATUSES.ERROR ||
      playerStatus === PLAYER_STATUSES.IDLE
    ) {
      resume();

      return;
    }

    playStation(station);
  };

  return (
    <article className={getCardClassName(isCurrentStation, hasCurrentStationError)}>
      <div className={S.logoWrapper}>
        {image ? (
          <img className={S.logo} src={image} alt={station.name} loading="lazy" />
        ) : (
          <div className={S.logoFallback}>{station.name.slice(0, 1).toUpperCase()}</div>
        )}
      </div>

      <div className={S.content}>
        <h3 className={S.title}>{station.name}</h3>

        <div className={S.meta}>
          <span>{station.country || 'Unknown country'}</span>
          <span>{station.language || 'Unknown language'}</span>
        </div>

        <div className={S.stats}>
          <span>Clicks: {station.clickcount}</span>
          <span>Bitrate: {bitrateLabel}</span>
        </div>

        {hasCurrentStationError && <div className={S.error}>{playerError}</div>}

        <div className={S.actions}>
          <button className={S.playButton} type="button" onClick={handlePlayClick} disabled={isButtonBusy}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  );
};
