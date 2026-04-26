import { useState } from 'react';
import { useSearchStationLanguages } from '@entities/station';
import { useDebouncedValue } from '@shared/hooks';
import { mapDiscoverFilterOptions } from '../../model/discover-filters';
import { useDiscoverContext } from '../../model';
import { FILTER_SUGGESTIONS_DEBOUNCE_MS, FILTER_SUGGESTIONS_LIMIT } from '../discover-filters-form/model/constants';
import { getSuggestionsQueryValue } from '../discover-filters-form/model/helpers';
import { DiscoverSuggestFilter } from '../discover-suggest-filter';
import { useTranslation } from '@/features/localization';

export const DiscoverLanguageFilter = () => {
  const { filters, onLanguageChange } = useDiscoverContext();

  const t = useTranslation();

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
      label={t.discover.languageLabel}
      placeholder={t.discover.languagePlaceholder}
      loadingText={t.discover.loadingLanguages}
      emptyText={t.discover.noMatchingLanguages}
      inputValue={inputValue}
      appliedValue={filters.language}
      options={mapDiscoverFilterOptions(suggestionsQuery.data ?? [])}
      isOptionsLoading={suggestionsQuery.isPending}
      onInputChange={setInputValue}
      onAppliedChange={onLanguageChange}
    />
  );
};
