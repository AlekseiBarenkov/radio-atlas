import {
  getPlayerPrimaryButtonLabel,
  PLAYER_STATUSES,
  runPlayerPrimaryAction,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import { Link } from 'react-router-dom';
import { getStationPath } from '@entities/station';
import type { RadioStation } from '@entities/station/model/types';
import { FavoriteToggle } from '@features/favorites';
import { getStationPlayerState } from '@entities/station';
import S from './station-card.module.css';
import { StationTitle } from './ui/station-title';

type StationCardProps = {
  station: RadioStation;
  searchQuery?: string;
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

export const StationCard = ({ station, searchQuery = '' }: StationCardProps) => {
  const image = getStationImage(station);
  const bitrateLabel = getStationBitrateLabel(station);

  const { currentStation, playerStatus, errorMessage, isReconnectSuggested } = usePlayerUiState();
  const actions = usePlayerActions();

  const { isCurrentStation, isButtonBusy, statusMessage } = getStationPlayerState({
    station,
    currentStation,
    playerStatus,
    errorMessage,
    isReconnectSuggested,
  });

  const hasCurrentStationError = isCurrentStation && playerStatus === PLAYER_STATUSES.ERROR && Boolean(errorMessage);

  const handlePlayClick = () => {
    if (isButtonBusy) {
      return;
    }

    runPlayerPrimaryAction({
      status: playerStatus,
      isReconnectSuggested,
      currentStation,
      targetStation: station,
      actions,
    });
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
        <h3 className={S.title}>
          <Link className={S.titleLink} to={getStationPath(station.stationuuid)}>
            <StationTitle name={station.name} searchQuery={searchQuery} />
          </Link>
        </h3>

        <div className={S.meta}>
          <span>{station.country || 'Unknown country'}</span>
          <span>{station.language || 'Unknown language'}</span>
        </div>

        <div className={S.stats}>
          <span>Clicks: {station.clickcount}</span>
          <span>Bitrate: {bitrateLabel}</span>
        </div>

        {statusMessage.tone === 'info' && <div className={S.meta}>{statusMessage.text}</div>}
        {statusMessage.tone === 'error' && <div className={S.error}>{statusMessage.text}</div>}

        <div className={S.actions}>
          <button className={S.playButton} type="button" onClick={handlePlayClick} disabled={isButtonBusy}>
            {getPlayerPrimaryButtonLabel({
              status: playerStatus,
              isReconnectSuggested,
              isCurrentStation,
            })}
          </button>

          <FavoriteToggle station={station} />
        </div>
      </div>
    </article>
  );
};
