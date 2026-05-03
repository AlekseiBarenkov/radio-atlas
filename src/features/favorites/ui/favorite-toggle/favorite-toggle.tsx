import type { RadioStation } from '@entities/station';
import { useTranslation } from '@features/localization';
import { useFavorites } from '@features/favorites';
import S from './favorite-toggle.module.css';
import { Button } from '@/shared/ui';
import { useToastActions } from '@/features/toast';

type FavoriteToggleProps = {
  station: RadioStation;
};

export const FavoriteToggle = (props: FavoriteToggleProps) => {
  const { station } = props;

  const t = useTranslation();
  const { showToast } = useToastActions();

  const { isFavorite, toggleFavorite } = useFavorites();

  const isStationFavorite = isFavorite(station.stationuuid);

  const handleClick = () => {
    toggleFavorite(station);

    showToast({
      tone: isStationFavorite ? 'info' : 'success',
      title: isStationFavorite ? t.favorites.removedToast : t.favorites.addedToast,
      description: station.name,
    });
  };

  return (
    <Button
      variant={isStationFavorite ? 'primary' : 'secondary'}
      onClick={handleClick}
      aria-pressed={isStationFavorite}
      aria-label={isStationFavorite ? t.favorites.remove : t.favorites.add}
    >
      <span className={S.icon} aria-hidden="true">
        {isStationFavorite ? '★' : '☆'}
      </span>
    </Button>
  );
};
