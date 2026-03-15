import { StationCard, useTopClickStations } from '@entities/station';
import S from './home-page.module.css';

export const HomePage = () => {
  const { stations, isLoading, isError, error } = useTopClickStations({
    limit: 24,
    hideBroken: true,
  });

  if (isLoading) {
    return <div>Загрузка станций...</div>;
  }

  if (isError) {
    return <div>Ошибка загрузки: {error?.message ?? 'Unknown error'}</div>;
  }

  return (
    <section className={S.page}>
      <header className={S.header}>
        <h1 className={S.title}>Top clicked stations</h1>
        <p className={S.description}>Популярные станции из Radio Browser</p>
      </header>

      <div className={S.grid}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
