import { useEffect, useState } from 'react';
import { StationCard, useSearchStations, useStations, type RadioStation } from '@entities/station';
import { useDebouncedValue } from '@shared/hooks';
import { Skeleton, SkeletonCard } from '@shared/ui';
import { DiscoverSearchForm } from './ui/discover-search-form';
import { DiscoverLoadMoreButton } from './ui/discover-load-more-button';
import S from './discover-page.module.css';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;
const SEARCH_DEBOUNCE_MS = 400;

const mergeStations = (currentStations: RadioStation[], nextStations: RadioStation[]): RadioStation[] => {
  const stationMap = new Map<string, RadioStation>();

  currentStations.forEach((station) => {
    stationMap.set(station.stationuuid, station);
  });

  nextStations.forEach((station) => {
    stationMap.set(station.stationuuid, station);
  });

  return Array.from(stationMap.values());
};

export const DiscoverPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [offset, setOffset] = useState(0);
  const [stations, setStations] = useState<RadioStation[]>([]);

  const debouncedSearchValue = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const normalizedSearchValue = debouncedSearchValue.trim();
  const isSearchMode = normalizedSearchValue.length > 0;

  const stationsQuery = useStations({
    limit: STATIONS_LIMIT,
    offset,
    hideBroken: true,
  });

  const searchQuery = useSearchStations({
    name: normalizedSearchValue,
    limit: STATIONS_LIMIT,
    hideBroken: true,
  });

  const activeQuery = isSearchMode ? searchQuery : stationsQuery;
  const currentPageStations = activeQuery.data ?? [];

  const handleLoadMore = () => {
    setOffset((currentOffset) => currentOffset + STATIONS_LIMIT);
  };

  const isLoadMoreVisible = !isSearchMode && currentPageStations.length === STATIONS_LIMIT;
  const isLoadMoreDisabled = activeQuery.isPending;

  useEffect(() => {
    setOffset(0);
  }, [normalizedSearchValue]);

  useEffect(() => {
    if (isSearchMode) {
      setStations(currentPageStations);

      return;
    }

    if (offset === 0) {
      setStations(currentPageStations);

      return;
    }

    setStations((previousStations) => mergeStations(previousStations, currentPageStations));
  }, [currentPageStations, isSearchMode, offset]);

  if (activeQuery.isPending && stations.length === 0) {
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

  if (activeQuery.isError && stations.length === 0) {
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

      {isLoadMoreVisible && (
        <div className={S.loadMore}>
          <DiscoverLoadMoreButton onClick={handleLoadMore} disabled={isLoadMoreDisabled} />
        </div>
      )}
    </section>
  );
};
