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
    emptyTitle: 'Nothing is playing',
    chooseStation: 'Choose a radio station',
    continuePrefix: 'Continue',
    continueListening: 'Continue listening',
    stop: 'Stop',
  },

  favorites: {
    add: 'Add to favorites',
    remove: 'Remove from favorites',
    inFavorites: 'In favorites',
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
    playbackError: 'Playback error',
  },

  discover: {
    title: 'Discover stations',
    description: 'Advanced station list from Radio Browser',
  },
} as const;

export type Translation = TranslationValue<typeof en>;
