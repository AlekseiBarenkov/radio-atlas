export type DiscoverFiltersState = {
  country: string;
  language: string;
  tag: string;
  hideBroken: boolean;
};

export type DiscoverFiltersFieldName = 'country' | 'language' | 'tag';

export type DiscoverFilterOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
};
