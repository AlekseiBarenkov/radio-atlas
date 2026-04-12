export type DiscoverFiltersState = {
  country: string;
  language: string;
  hideBroken: boolean;
};

export type DiscoverFiltersFieldName = 'country' | 'language';

export type DiscoverFiltersChange = {
  name: DiscoverFiltersFieldName;
  value: string;
};
