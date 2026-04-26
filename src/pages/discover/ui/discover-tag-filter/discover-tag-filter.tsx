import { useState } from 'react';
import { useSearchStationTags } from '@entities/station';
import { useDebouncedValue } from '@shared/hooks';
import { mapDiscoverFilterOptions } from '../../model/discover-filters';
import { useDiscoverContext } from '../../model';
import { FILTER_SUGGESTIONS_DEBOUNCE_MS, FILTER_SUGGESTIONS_LIMIT } from '../discover-filters-form/model/constants';
import { getSuggestionsQueryValue } from '../discover-filters-form/model/helpers';
import { DiscoverSuggestFilter } from '../discover-suggest-filter';

export const DiscoverTagFilter = () => {
  const { filters, onTagChange } = useDiscoverContext();

  const [isSuggestionsEnabled, setIsSuggestionsEnabled] = useState(false);
  const [inputValue, setInputValue] = useState(filters.tag);

  const debouncedInputValue = useDebouncedValue(inputValue, FILTER_SUGGESTIONS_DEBOUNCE_MS);
  const suggestionsQueryValue = getSuggestionsQueryValue(debouncedInputValue, filters.tag);

  const suggestionsQuery = useSearchStationTags({
    query: suggestionsQueryValue,
    limit: FILTER_SUGGESTIONS_LIMIT,
    enabled: isSuggestionsEnabled,
  });

  return (
    <DiscoverSuggestFilter
      inputId="discover-filter-tag"
      inputName="discover-filter-tag"
      label="Genre / tag"
      placeholder="Type genre or tag"
      inputValue={inputValue}
      appliedValue={filters.tag}
      options={mapDiscoverFilterOptions(suggestionsQuery.data ?? [])}
      isOptionsLoading={suggestionsQuery.isPending}
      loadingText="Loading tags..."
      emptyText="No matching tags"
      showSuggestionsOnEmptyInput
      onInputChange={setInputValue}
      onAppliedChange={onTagChange}
      onInputFocus={() => setIsSuggestionsEnabled(true)}
    />
  );
};
