export type DiscoverFiltersState = {
  country: string;
  language: string;
  hideBroken: boolean;
};

export type DiscoverFiltersDraftState = {
  country: string;
  language: string;
};

export type DiscoverFiltersFieldName = 'country' | 'language';

export type DiscoverFiltersChange = {
  name: DiscoverFiltersFieldName;
  value: string;
};

export type DiscoverFilterOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
};
