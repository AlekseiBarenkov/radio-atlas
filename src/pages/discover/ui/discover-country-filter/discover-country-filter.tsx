import { useState } from 'react';
import { useSearchStationCountries } from '@entities/station';
import { useDebouncedValue } from '@shared/hooks';
import { mapDiscoverFilterOptions } from '../../model/discover-filters';
import { useDiscoverContext } from '../../model';
import { FILTER_SUGGESTIONS_DEBOUNCE_MS, FILTER_SUGGESTIONS_LIMIT } from '../discover-filters-form/model/constants';
import { getSuggestionsQueryValue } from '../discover-filters-form/model/helpers';
import { DiscoverSuggestFilter } from '../discover-suggest-filter';

export const DiscoverCountryFilter = () => {
  const { filters, onCountryChange } = useDiscoverContext();

  const [inputValue, setInputValue] = useState(filters.country);

  const debouncedInputValue = useDebouncedValue(inputValue, FILTER_SUGGESTIONS_DEBOUNCE_MS);
  const suggestionsQueryValue = getSuggestionsQueryValue(debouncedInputValue, filters.country);

  const suggestionsQuery = useSearchStationCountries({
    query: suggestionsQueryValue,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  return (
    <DiscoverSuggestFilter
      inputId="discover-filter-country"
      inputName="discover-filter-country"
      label="Country"
      placeholder="Type country"
      inputValue={inputValue}
      appliedValue={filters.country}
      options={mapDiscoverFilterOptions(suggestionsQuery.data ?? [])}
      isOptionsLoading={suggestionsQuery.isPending}
      loadingText="Loading countries..."
      emptyText="No matching countries"
      onInputChange={setInputValue}
      onAppliedChange={onCountryChange}
    />
  );
};
