import { useCallback, useState, type PropsWithChildren } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_DISCOVER_FILTERS,
  getDiscoverFiltersFromSearchParams,
  setDiscoverFiltersToSearchParams,
  type DiscoverFiltersState,
} from './discover-filters';
import { DiscoverContext, type DiscoverContextValue } from './discover-context';

export const DiscoverProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState<DiscoverContextValue['search']>('');
  const [filters, setFilters] = useState<DiscoverContextValue['filters']>(() =>
    getDiscoverFiltersFromSearchParams(searchParams),
  );

  const updateFilters = useCallback(
    (updater: (currentState: DiscoverContextValue['filters']) => DiscoverContextValue['filters']) => {
      let nextFilters: DiscoverFiltersState | null = null;

      setFilters((currentState) => {
        const nextState = updater(currentState);

        nextFilters = nextState;

        return nextState;
      });

      setSearchParams((currentSearchParams) => {
        if (nextFilters === null) {
          return currentSearchParams;
        }

        return setDiscoverFiltersToSearchParams(currentSearchParams, nextFilters);
      });
    },
    [setSearchParams],
  );

  const handleSearchChange: DiscoverContextValue['onSearchChange'] = useCallback((value) => {
    setSearch(value.trim());
  }, []);

  const handleCountryChange: DiscoverContextValue['onCountryChange'] = useCallback(
    (value) => {
      updateFilters((currentState) => ({
        ...currentState,
        country: value.trim(),
      }));
    },
    [updateFilters],
  );

  const handleLanguageChange: DiscoverContextValue['onLanguageChange'] = useCallback(
    (value) => {
      updateFilters((currentState) => ({
        ...currentState,
        language: value.trim(),
      }));
    },
    [updateFilters],
  );

  const handleTagChange: DiscoverContextValue['onTagChange'] = useCallback(
    (value) => {
      updateFilters((currentState) => ({
        ...currentState,
        tag: value.trim(),
      }));
    },
    [updateFilters],
  );

  const handleHideBrokenChange: DiscoverContextValue['onHideBrokenChange'] = useCallback(
    (value) => {
      updateFilters((currentState) => ({
        ...currentState,
        hideBroken: value,
      }));
    },
    [updateFilters],
  );

  const handleResetFilters: DiscoverContextValue['onResetFilters'] = useCallback(() => {
    updateFilters(() => DEFAULT_DISCOVER_FILTERS);
  }, [updateFilters]);

  return (
    <DiscoverContext.Provider
      value={{
        search,
        onSearchChange: handleSearchChange,

        filters,
        onCountryChange: handleCountryChange,
        onLanguageChange: handleLanguageChange,
        onTagChange: handleTagChange,
        onHideBrokenChange: handleHideBrokenChange,
        onResetFilters: handleResetFilters,
      }}
    >
      {children}
    </DiscoverContext.Provider>
  );
};
