import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  getStations,
  StationCard,
  useSearchStationCountries,
  useSearchStationLanguages,
  useSearchStations,
} from '@entities/station';
import {
  DiscoverFiltersForm,
  getHasActiveDiscoverFilters,
  mapDiscoverFilterOptions,
  useDiscoverFilters,
} from '@features/discover-filters';
import { useDebouncedValue } from '@shared/hooks';
import { Skeleton, SkeletonCard } from '@shared/ui';
import { DiscoverLoadMoreButton } from './ui/discover-load-more-button';
import { DiscoverSearchForm } from './ui/discover-search-form';
import { DiscoverPageHeader } from './ui/discover-page-header';
import S from './discover-page.module.css';
import { mergeStations } from './lib';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;
const SEARCH_DEBOUNCE_MS = 400;
const FILTER_SUGGESTIONS_LIMIT = 8;

export const DiscoverPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [pageOffsets, setPageOffsets] = useState<number[]>([0]);

  const {
    filters,
    drafts,
    normalizedFilters,
    setCountryDraft,
    setLanguageDraft,
    applyCountry,
    applyLanguage,
    setHideBroken,
    resetFilters,
  } = useDiscoverFilters();

  const debouncedSearchValue = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const normalizedSearchValue = debouncedSearchValue.trim();
  const debouncedFilters = useDebouncedValue(filters, SEARCH_DEBOUNCE_MS);
  const debouncedCountryDraft = useDebouncedValue(drafts.country, SEARCH_DEBOUNCE_MS);
  const debouncedLanguageDraft = useDebouncedValue(drafts.language, SEARCH_DEBOUNCE_MS);

  const isSearchMode = normalizedSearchValue.length > 0;

  const countrySuggestionsQuery = useSearchStationCountries({
    query: debouncedCountryDraft,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const languageSuggestionsQuery = useSearchStationLanguages({
    query: debouncedLanguageDraft,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const countryOptions = useMemo(() => {
    return mapDiscoverFilterOptions(countrySuggestionsQuery.data ?? []);
  }, [countrySuggestionsQuery.data]);

  const languageOptions = useMemo(() => {
    return mapDiscoverFilterOptions(languageSuggestionsQuery.data ?? []);
  }, [languageSuggestionsQuery.data]);

  const hasActiveFilters = getHasActiveDiscoverFilters(normalizedFilters);
  const isFilteredMode = isSearchMode || hasActiveFilters;

  const stationsQueries = useQueries({
    queries: pageOffsets.map((offset) => ({
      queryKey: [
        'stations',
        offset,
        STATIONS_LIMIT,
        debouncedFilters.hideBroken,
        debouncedFilters.country,
        debouncedFilters.language,
      ] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getStations(
          {
            limit: STATIONS_LIMIT,
            offset,
            hideBroken: debouncedFilters.hideBroken,
            country: debouncedFilters.country,
            language: debouncedFilters.language,
          },
          signal,
        ),
      enabled: !isSearchMode,
    })),
  });

  const searchQuery = useSearchStations({
    name: normalizedSearchValue,
    country: normalizedFilters.country,
    language: normalizedFilters.language,
    limit: STATIONS_LIMIT,
    hideBroken: normalizedFilters.hideBroken,
  });

  const stations = useMemo(() => {
    if (isSearchMode) {
      return searchQuery.data ?? [];
    }

    return mergeStations(stationsQueries.map((query) => query.data ?? []));
  }, [isSearchMode, searchQuery.data, stationsQueries]);

  const isInitialStationsPending =
    !isSearchMode && stationsQueries.some((query) => query.isPending) && stations.length === 0;
  const isStationsError = !isSearchMode && stationsQueries.some((query) => query.isError) && stations.length === 0;
  const stationsError = !isSearchMode ? (stationsQueries.find((query) => query.error)?.error ?? null) : null;

  const activeIsPending = isSearchMode ? searchQuery.isPending : isInitialStationsPending;
  const activeIsError = isSearchMode ? searchQuery.isError : isStationsError;
  const activeError = isSearchMode ? (searchQuery.error ?? null) : stationsError;

  const lastStationsQuery = isSearchMode ? null : stationsQueries[stationsQueries.length - 1];
  const lastStationsPage = lastStationsQuery?.data ?? [];

  const isLoadMoreVisible = !isSearchMode && lastStationsPage.length === STATIONS_LIMIT;
  const isLoadMoreDisabled = !isSearchMode && stationsQueries.some((query) => query.isPending);

  const resetPagination = () => {
    setPageOffsets([0]);
  };

  const handleLoadMore = () => {
    const nextOffset = pageOffsets[pageOffsets.length - 1] + STATIONS_LIMIT;

    setPageOffsets((prev) => [...prev, nextOffset]);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    resetPagination();
  };

  const handleCountryChange = (value: string) => {
    setCountryDraft(value);

    if (value.trim().length === 0) {
      resetPagination();
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguageDraft(value);

    if (value.trim().length === 0) {
      resetPagination();
    }
  };

  const applyFiltersChange = (callback: () => void) => {
    callback();
    resetPagination();
  };

  const handleCountrySelect = (value: string) => {
    applyFiltersChange(() => {
      applyCountry(value);
    });
  };

  const handleLanguageSelect = (value: string) => {
    applyFiltersChange(() => {
      applyLanguage(value);
    });
  };

  const handleHideBrokenChange = (value: boolean) => {
    applyFiltersChange(() => {
      setHideBroken(value);
    });
  };

  const handleResetFilters = () => {
    applyFiltersChange(() => {
      resetFilters();
    });
  };

  const controls = (
    <div className={S.controls}>
      <DiscoverSearchForm value={searchValue} onChange={handleSearchChange} />
      <DiscoverFiltersForm
        filters={filters}
        drafts={drafts}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        isCountryOptionsLoading={countrySuggestionsQuery.isPending}
        isLanguageOptionsLoading={languageSuggestionsQuery.isPending}
        onCountryChange={handleCountryChange}
        onLanguageChange={handleLanguageChange}
        onCountrySelect={handleCountrySelect}
        onLanguageSelect={handleLanguageSelect}
        onHideBrokenChange={handleHideBrokenChange}
        onReset={handleResetFilters}
      />
    </div>
  );

  if (activeIsPending) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <Skeleton width={180} height={38} />
          <Skeleton width={320} height={20} />
        </header>

        {controls}

        <div className={S.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (activeIsError) {
    return (
      <section className={S.page}>
        <DiscoverPageHeader />

        {controls}

        <div>Ошибка загрузки: {activeError?.message ?? 'Unknown error'}</div>
      </section>
    );
  }

  if (stations.length === 0) {
    return (
      <section className={S.page}>
        <DiscoverPageHeader />

        {controls}

        <div>{isFilteredMode ? 'Станции по текущим параметрам не найдены' : 'Станции не найдены'}</div>
      </section>
    );
  }

  return (
    <section className={S.page}>
      <DiscoverPageHeader />

      {controls}

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
