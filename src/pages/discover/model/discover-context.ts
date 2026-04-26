import { createContext, useContext } from 'react';
import type { DiscoverFiltersState } from './discover-filters';

export type DiscoverContextValue = {
  search: string;
  onSearchChange: (value: string) => void;

  filters: DiscoverFiltersState;
  onCountryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onHideBrokenChange: (value: boolean) => void;
  onResetFilters: () => void;
};

export const DiscoverContext = createContext<DiscoverContextValue | null>(null);

export const useDiscoverContext = (): DiscoverContextValue => {
  const context = useContext(DiscoverContext);

  if (context === null) {
    throw new Error('useDiscoverContext must be used within DiscoverProvider');
  }

  return context;
};
