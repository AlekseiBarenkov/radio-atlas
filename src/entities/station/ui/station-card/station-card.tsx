import {
  getPlayerPrimaryButtonLabel,
  PLAYER_STATUSES,
  PlayerPrimaryIconButton,
  runPlayerPrimaryAction,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import { Link } from 'react-router-dom';
import { getStationPath, StationLogo } from '@entities/station';
import type { RadioStation } from '@entities/station/model/types';
import { FavoriteToggle } from '@features/favorites';
import { getStationPlayerState } from '@entities/station';
import S from './station-card.module.css';
import { StationTitle } from './ui/station-title';
import { useTranslation } from '@/features/localization';

type StationCardProps = {
  station: RadioStation;
  searchQuery?: string;
};

const getStationBitrateLabel = (station: RadioStation, unknownBitrateText: string): string => {
  return station.bitrate > 0 ? String(station.bitrate) : unknownBitrateText;
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
  const t = useTranslation();

  const bitrateLabel = getStationBitrateLabel(station, t.common.unknownBitrate);

  const { currentStation, playerStatus, errorMessage } = usePlayerUiState();
  const actions = usePlayerActions();

  const { isCurrentStation, isButtonBusy } = getStationPlayerState({
    station,
    currentStation,
    playerStatus,
  });

  const hasCurrentStationError = isCurrentStation && playerStatus === PLAYER_STATUSES.ERROR && Boolean(errorMessage);

  const handlePlayClick = () => {
    if (isButtonBusy) {
      return;
    }

    runPlayerPrimaryAction({
      status: playerStatus,
      currentStation,
      targetStation: station,
      actions,
    });
  };

  return (
    <article className={getCardClassName(isCurrentStation, hasCurrentStationError)}>
      <div className={S.logoWrapper}>
        <StationLogo station={station} size="card" />
      </div>

      <div className={S.content}>
        <h3 className={S.title}>
          <Link className={S.titleLink} to={getStationPath(station.stationuuid)}>
            <StationTitle name={station.name} searchQuery={searchQuery} />
          </Link>
        </h3>

        <div className={S.meta}>
          <span>{station.country || t.common.unknownCountry}</span>
          <span>{station.language || t.common.unknownLanguage}</span>
        </div>

        <div className={S.stats}>
          <span>
            {t.common.clicks}: {station.clickcount}
          </span>
          <span>
            {t.common.bitrate}: {bitrateLabel}
          </span>
        </div>

        <div className={S.actions}>
          <PlayerPrimaryIconButton
            status={playerStatus}
            label={getPlayerPrimaryButtonLabel({
              status: playerStatus,
              isCurrentStation,
              t,
            })}
            isCurrentStation={isCurrentStation}
            disabled={isButtonBusy}
            onClick={handlePlayClick}
          />

          <FavoriteToggle station={station} />
        </div>
      </div>
    </article>
  );
};
