import { useState } from 'react';
import { useSearchStationTags } from '@entities/station';
import { useDebouncedValue } from '@shared/hooks';
import { mapDiscoverFilterOptions } from '../../model/discover-filters';
import { useDiscoverContext } from '../../model';
import { FILTER_SUGGESTIONS_DEBOUNCE_MS, FILTER_SUGGESTIONS_LIMIT } from '../discover-filters-form/model/constants';
import { getSuggestionsQueryValue } from '../discover-filters-form/model/helpers';
import { DiscoverSuggestFilter } from '../discover-suggest-filter';
import { useTranslation } from '@/features/localization';

export const DiscoverTagFilter = () => {
  const { filters, onTagChange } = useDiscoverContext();

  const t = useTranslation();

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
      label={t.discover.tagLabel}
      placeholder={t.discover.tagPlaceholder}
      loadingText={t.discover.loadingTags}
      emptyText={t.discover.noMatchingTags}
      inputValue={inputValue}
      appliedValue={filters.tag}
      options={mapDiscoverFilterOptions(suggestionsQuery.data ?? [])}
      isOptionsLoading={suggestionsQuery.isPending}
      showSuggestionsOnEmptyInput
      onInputChange={setInputValue}
      onAppliedChange={onTagChange}
      onInputFocus={() => setIsSuggestionsEnabled(true)}
    />
  );
};
