import { StationCard } from '@entities/station';
import { useFavorites } from '@features/favorites';
import S from './favorites-page.module.css';
import { useTranslation } from '@/features/localization';
import { PageHeader } from '@/shared/ui';

export const FavoritesPage = () => {
  const t = useTranslation();

  const { favoriteStations } = useFavorites();
  const favoritesCount = favoriteStations.length;

  return (
    <section className={S.page}>
      <PageHeader title={t.favoritesPage.title} description={t.favoritesPage.description}>
        {favoritesCount > 0 && (
          <div className={S.count}>
            {t.favoritesPage.savedCount}: {favoritesCount}
          </div>
        )}
      </PageHeader>

      {favoritesCount === 0 && <div className={S.empty}>{t.favoritesPage.empty}</div>}

      {favoritesCount > 0 && (
        <div className={S.grid}>
          {favoriteStations.map((station) => (
            <StationCard key={station.stationuuid} station={station} />
          ))}
        </div>
      )}
    </section>
  );
};
