type TranslationValue<TValue> = TValue extends string
  ? string
  : TValue extends Record<string, unknown>
    ? { readonly [TKey in keyof TValue]: TranslationValue<TValue[TKey]> }
    : never;

export const en = {
  common: {
    unknownError: 'Unknown error',
    unknownCountry: 'Unknown country',
    unknownLanguage: 'Unknown language',
    unknown: 'Unknown',

    clicks: 'Clicks',
    bitrate: 'Bitrate',
    unknownBitrate: 'unknown',
  },

  home: {
    eyebrow: 'Radio Atlas',
    heroTitle: 'Listen to radio stations around the world',
    heroDescription:
      'Discover popular online radio, save favorite stations and quickly return to what you played recently.',
    globalStations: 'Global stations',
    favorites: 'Favorites',
    recentlyPlayed: 'Recently played',
    exploreStations: 'Explore stations',

    topClickedTitle: 'Top clicked stations',
    topClickedDescription: 'Popular stations from Radio Browser',

    stationsNotFound: 'Stations not found',
    loadingError: 'Loading error',

    featuresAriaLabel: 'Radio Atlas features',
  },

  sidebar: {
    ariaLabel: 'Sidebar',
    title: 'Radio Atlas',
    subtitle: 'Browse stations and manage favorites',
    navAriaLabel: 'Sidebar navigation',
    home: 'Home',
    discover: 'Discover',
    favorites: 'Favorites',
  },

  recentlyPlayed: {
    title: 'Recently played',
    description: 'Stations you recently played',
    empty: 'No recently played stations',
    clear: 'Clear history',
  },

  miniPlayer: {
    stop: 'Stop',
  },

  favorites: {
    add: 'Add to favorites',
    remove: 'Remove from favorites',
  },

  player: {
    play: 'Play',
    loading: 'Loading...',
    reconnect: 'Reconnect',
    buffering: 'Buffering...',
    resume: 'Resume',
    pause: 'Pause',
    retry: 'Retry',

    connecting: 'Connecting to station...',
    longBuffering: 'The stream is buffering for too long. Try reconnecting.',
    streamBuffering: 'Buffering stream...',
    paused: 'Paused',
    playbackError: 'Stream may be unavailable in browser',

    openStream: 'Open stream',
  },

  discover: {
    title: 'Discover stations',
    description: 'Advanced station list from Radio Browser',

    country: 'Country',
    language: 'Language',
    tag: 'Tag',

    sortBy: 'Sort by',
    sortPopular: 'Popular',
    sortTrending: 'Trending',
    sortName: 'A-Z',

    searchLabel: 'Search stations',
    searchPlaceholder: 'Search by station name',
    clearSearch: 'Clear',

    countryLabel: 'Country',
    countryPlaceholder: 'Type country',
    loadingCountries: 'Loading countries...',
    noMatchingCountries: 'No matching countries',

    languageLabel: 'Language',
    languagePlaceholder: 'Type language',
    loadingLanguages: 'Loading languages...',
    noMatchingLanguages: 'No matching languages',

    tagLabel: 'Genre / tag',
    tagPlaceholder: 'Type genre or tag',
    loadingTags: 'Loading tags...',
    noMatchingTags: 'No matching tags',

    hideBroken: 'Hide broken stations',
    clearFilters: 'Clear filters',
    activeFiltersAriaLabel: 'Active filters',
    removeCountryFilter: 'Remove country filter',
    removeLanguageFilter: 'Remove language filter',
    removeTagFilter: 'Remove tag filter',
    resetHideBrokenFilter: 'Reset hide broken filter',
    brokenStationsVisible: 'Broken stations visible',

    resultsFor: 'Results for',
    includingBroken: 'including broken',
    station: 'station',
    stations: 'stations',

    loadingError: 'Loading error',
    emptyFiltered: 'No stations found for current parameters',
    emptyDefault: 'Stations not found',
  },

  favoritesPage: {
    title: 'Favorites',
    description: 'Your saved radio stations',
    empty: 'You have no favorite stations yet',
    savedCount: 'Saved stations',
  },

  similarStations: {
    title: 'Similar stations',
    error: 'Failed to load similar stations',
  },

  stationPage: {
    back: 'Back',
    metadata: 'Station metadata',
    country: 'Country',
    language: 'Language',
    bitrate: 'Bitrate',
    codec: 'Codec',
    clicks: 'Clicks',
    votes: 'Votes',
    tags: 'Tags',
    tagsEmpty: 'No tags specified for this station',
    stationNotFound: 'Station not found',
    loadingError: 'Station loading error',
  },

  languageSwitcher: {
    ariaLabel: 'Language switcher',
  },

  themeSwitcher: {
    ariaLabel: 'Theme switcher',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },

  toast: {
    close: 'Close notification',
  },
} as const;

export type Translation = TranslationValue<typeof en>;
