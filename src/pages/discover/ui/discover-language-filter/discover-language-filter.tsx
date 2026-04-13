import { useState } from 'react';
import { useSearchStationLanguages } from '@entities/station';
import { useDebouncedValue } from '@shared/hooks';
import { mapDiscoverFilterOptions } from '../../model/discover-filters';
import { useDiscoverContext } from '../../model';
import { FILTER_SUGGESTIONS_DEBOUNCE_MS, FILTER_SUGGESTIONS_LIMIT } from '../discover-filters-form/model/constants';
import { getSuggestionsQueryValue } from '../discover-filters-form/model/helpers';
import { DiscoverSuggestFilter } from '../discover-suggest-filter';

export const DiscoverLanguageFilter = () => {
  const { filters, onLanguageChange } = useDiscoverContext();

  const [inputValue, setInputValue] = useState(filters.language);

  const debouncedInputValue = useDebouncedValue(inputValue, FILTER_SUGGESTIONS_DEBOUNCE_MS);
  const suggestionsQueryValue = getSuggestionsQueryValue(debouncedInputValue, filters.language);

  const suggestionsQuery = useSearchStationLanguages({
    query: suggestionsQueryValue,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  return (
    <DiscoverSuggestFilter
      inputId="discover-filter-language"
      inputName="discover-filter-language"
      label="Language"
      placeholder="Type language"
      inputValue={inputValue}
      appliedValue={filters.language}
      options={mapDiscoverFilterOptions(suggestionsQuery.data ?? [])}
      isOptionsLoading={suggestionsQuery.isPending}
      loadingText="Loading languages..."
      emptyText="No matching languages"
      onInputChange={setInputValue}
      onAppliedChange={onLanguageChange}
    />
  );
};
