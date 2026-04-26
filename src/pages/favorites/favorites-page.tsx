import { StationCard } from '@entities/station';
import { useFavorites } from '@features/favorites';
import S from './favorites-page.module.css';
import { useTranslation } from '@/features/localization';

export const FavoritesPage = () => {
  const t = useTranslation();

  const { favoriteStations } = useFavorites();
  const favoritesCount = favoriteStations.length;

  if (favoritesCount === 0) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <h1 className={S.title}>{t.favoritesPage.title}</h1>
          <p className={S.description}>{t.favoritesPage.description}</p>
        </header>

        <div className={S.empty}>{t.favoritesPage.empty}</div>
      </section>
    );
  }

  return (
    <section className={S.page}>
      <header className={S.header}>
        <h1 className={S.title}>{t.favoritesPage.title}</h1>
        <p className={S.description}>{t.favoritesPage.description}</p>
        <div className={S.count}>
          {t.favoritesPage.savedCount}: {favoritesCount}
        </div>
      </header>

      <div className={S.grid}>
        {favoriteStations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
