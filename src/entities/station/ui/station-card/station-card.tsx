import { useMemo } from 'react';
import { useCurrentStation, usePlayerActions, usePlayerStatus, PLAYER_STATUSES } from '@features/player';
import type { RadioStation } from '@entities/station/model/types';
import S from './station-card.module.css';

type StationCardProps = {
  station: RadioStation;
};

const getStationImage = (station: RadioStation): string | null => {
  const favicon = station.favicon.trim();

  return favicon.length > 0 ? favicon : null;
};

export const StationCard = ({ station }: StationCardProps) => {
  const image = getStationImage(station);

  const currentStation = useCurrentStation();
  const playerStatus = usePlayerStatus();
  const { playStation, pause, resume } = usePlayerActions();

  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;

  const buttonLabel = useMemo(() => {
    if (!isCurrentStation) {
      return 'Play';
    }

    if (playerStatus === PLAYER_STATUSES.LOADING) {
      return 'Loading...';
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
    <article className={S.card}>
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
          <span>Bitrate: {station.bitrate || 0}</span>
        </div>

        <div className={S.actions}>
          <button className={S.playButton} type="button" onClick={handlePlayClick}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </article>
  );
};
