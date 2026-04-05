import { useState } from 'react';
import { StationCard, useSearchStations, useStations } from '@entities/station';
import { Skeleton, SkeletonCard } from '@shared/ui';
import { DiscoverSearchForm } from './ui/discover-search-form';
import S from './discover-page.module.css';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;

export const DiscoverPage = () => {
  const [searchValue, setSearchValue] = useState('');

  const normalizedSearchValue = searchValue.trim();
  const isSearchMode = normalizedSearchValue.length > 0;

  const stationsQuery = useStations({
    limit: STATIONS_LIMIT,
    offset: 0,
    hideBroken: true,
  });

  const searchQuery = useSearchStations({
    name: normalizedSearchValue,
    limit: STATIONS_LIMIT,
    hideBroken: true,
  });

  const activeQuery = isSearchMode ? searchQuery : stationsQuery;
  const stations = activeQuery.data ?? [];

  if (activeQuery.isPending) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <Skeleton width={180} height={38} />
          <Skeleton width={320} height={20} />
        </header>

        <DiscoverSearchForm value={searchValue} onChange={setSearchValue} />

        <div className={S.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (activeQuery.isError) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <h1 className={S.title}>Discover stations</h1>
          <p className={S.description}>Расширенный список станций из Radio Browser</p>
        </header>

        <DiscoverSearchForm value={searchValue} onChange={setSearchValue} />

        <div>Ошибка загрузки: {activeQuery.error?.message ?? 'Unknown error'}</div>
      </section>
    );
  }

  if (stations.length === 0) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <h1 className={S.title}>Discover stations</h1>
          <p className={S.description}>Расширенный список станций из Radio Browser</p>
        </header>

        <DiscoverSearchForm value={searchValue} onChange={setSearchValue} />

        <div>{isSearchMode ? 'По вашему запросу станции не найдены' : 'Станции не найдены'}</div>
      </section>
    );
  }

  return (
    <section className={S.page}>
      <header className={S.header}>
        <h1 className={S.title}>Discover stations</h1>
        <p className={S.description}>Расширенный список станций из Radio Browser</p>
      </header>

      <DiscoverSearchForm value={searchValue} onChange={setSearchValue} />

      <div className={S.grid}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
