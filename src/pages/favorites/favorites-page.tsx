import { StationCard } from '@entities/station';
import { useFavorites } from '@features/favorites';
import S from './favorites-page.module.css';

export const FavoritesPage = () => {
  const { favoriteStations } = useFavorites();

  if (favoriteStations.length === 0) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <h1 className={S.title}>Favorites</h1>
          <p className={S.description}>Ваши сохранённые радиостанции</p>
        </header>

        <div className={S.empty}>У вас пока нет избранных станций</div>
      </section>
    );
  }

  return (
    <section className={S.page}>
      <header className={S.header}>
        <h1 className={S.title}>Favorites</h1>
        <p className={S.description}>Ваши сохранённые радиостанции</p>
      </header>

      <div className={S.grid}>
        {favoriteStations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
