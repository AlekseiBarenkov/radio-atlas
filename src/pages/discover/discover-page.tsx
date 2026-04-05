import { StationCard, useStations } from '@entities/station';
import { Skeleton, SkeletonCard } from '@shared/ui';
import S from './discover-page.module.css';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;

export const DiscoverPage = () => {
  const query = useStations({
    limit: STATIONS_LIMIT,
    offset: 0,
    hideBroken: true,
  });

  const stations = query.data ?? [];

  if (query.isPending) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <Skeleton width={180} height={38} />
          <Skeleton width={320} height={20} />
        </header>

        <div className={S.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className={S.page}>
        <div>Ошибка загрузки: {query.error?.message ?? 'Unknown error'}</div>
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
        <h1 className={S.title}>Discover stations</h1>
        <p className={S.description}>Расширенный список станций из Radio Browser</p>
      </header>

      <div className={S.grid}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
