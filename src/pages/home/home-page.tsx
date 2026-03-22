import { StationCard, useTopClickStations } from '@entities/station';
import { Skeleton, SkeletonCard } from '@shared/ui';
import S from './home-page.module.css';

const SKELETON_ITEMS = 6;

export const HomePage = () => {
  const { stations, isLoading, isError, error } = useTopClickStations({
    limit: 24,
    hideBroken: true,
  });

  if (isLoading) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <Skeleton width={280} height={38} />
          <Skeleton width={320} height={20} />
        </header>

        <div className={S.grid}>
          {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={S.page}>
        <div>Ошибка загрузки: {error?.message ?? 'Unknown error'}</div>
      </section>
    );
  }

  if (stations.length === 0) {
    return (
      <section className={S.page}>
        <div>Станции не найдены</div>
      </section>
    );
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
