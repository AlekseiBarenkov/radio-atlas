export type DiscoverFiltersState = {
  country: string;
  language: string;
  hideBroken: boolean;
};

export type DiscoverFiltersFieldName = 'country' | 'language';

export type DiscoverFilterOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
};
