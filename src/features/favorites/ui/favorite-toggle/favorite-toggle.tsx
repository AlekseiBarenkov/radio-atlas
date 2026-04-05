import type { RadioStation } from '@entities/station';
import { useFavorites } from '@features/favorites';
import S from './favorite-toggle.module.css';

type FavoriteToggleProps = {
  station: RadioStation;
};

const getButtonClassName = (isFavorite: boolean): string => {
  return isFavorite ? `${S.button} ${S.buttonActive}` : S.button;
};

export const FavoriteToggle = (props: FavoriteToggleProps) => {
  const { station } = props;

  const { isFavorite, toggleFavorite } = useFavorites();

  const isStationFavorite = isFavorite(station.stationuuid);

  const handleClick = () => {
    toggleFavorite(station);
  };

  return (
    <button
      className={getButtonClassName(isStationFavorite)}
      type="button"
      onClick={handleClick}
      aria-pressed={isStationFavorite}
      aria-label={isStationFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isStationFavorite ? '★' : '☆'}
    </button>
  );
};
