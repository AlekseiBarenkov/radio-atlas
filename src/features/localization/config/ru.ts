import type { Translation } from './en';

export const ru = {
  common: {
    unknownError: 'Неизвестная ошибка',
    unknownCountry: 'Страна неизвестна',
    unknownLanguage: 'Язык неизвестен',
    unknown: 'Неизвестно',

    clicks: 'Клики',
    bitrate: 'Битрейт',
    unknownBitrate: 'неизвестно',
  },

  home: {
    eyebrow: 'Radio Atlas',
    heroTitle: 'Слушайте радиостанции со всего мира',
    heroDescription:
      'Открывайте популярное онлайн-радио, сохраняйте избранные станции и быстро возвращайтесь к недавно прослушанным.',
    globalStations: 'Станции со всего мира',
    favorites: 'Избранное',
    recentlyPlayed: 'Недавно слушали',
    exploreStations: 'Смотреть станции',

    topClickedTitle: 'Популярные станции',
    topClickedDescription: 'Популярные станции из Radio Browser',

    stationsNotFound: 'Станции не найдены',
    loadingError: 'Ошибка загрузки',

    featuresAriaLabel: 'Возможности Radio Atlas',
  },

  sidebar: {
    ariaLabel: 'Боковая панель',
    title: 'Radio Atlas',
    subtitle: 'Ищите станции и управляйте избранным',
    navAriaLabel: 'Навигация боковой панели',
    home: 'Главная',
    discover: 'Поиск',
    favorites: 'Избранное',
  },

  recentlyPlayed: {
    title: 'Недавно слушали',
    description: 'Станции, которые вы недавно запускали',
    empty: 'Нет недавно прослушанных станций',
    clear: 'Очистить историю',
  },

  miniPlayer: {
    stop: 'Стоп',
  },

  favorites: {
    add: 'Добавить в избранное',
    remove: 'Удалить из избранного',
  },

  player: {
    play: 'Играть',
    loading: 'Загрузка...',
    reconnect: 'Переподключить',
    buffering: 'Буферизация...',
    resume: 'Продолжить',
    pause: 'Пауза',
    retry: 'Повторить',

    connecting: 'Подключение к станции...',
    longBuffering: 'Поток долго буферизуется. Попробуйте переподключить.',
    streamBuffering: 'Буферизация потока...',
    paused: 'Пауза',
    playbackError: 'Поток может быть недоступен в браузере',

    openStream: 'Открыть поток',
  },

  discover: {
    title: 'Поиск станций',
    description: 'Расширенный список станций из Radio Browser',

    country: 'Страна',
    language: 'Язык',
    tag: 'Тег',

    sortBy: 'Сортировка',
    sortPopular: 'Популярные',
    sortTrending: 'В тренде',
    sortName: 'А–Я',

    searchLabel: 'Поиск станций',
    searchPlaceholder: 'Поиск по названию станции',
    clearSearch: 'Очистить',

    countryLabel: 'Страна',
    countryPlaceholder: 'Введите страну',
    loadingCountries: 'Загрузка стран...',
    noMatchingCountries: 'Подходящие страны не найдены',

    languageLabel: 'Язык',
    languagePlaceholder: 'Введите язык',
    loadingLanguages: 'Загрузка языков...',
    noMatchingLanguages: 'Подходящие языки не найдены',

    tagLabel: 'Жанр / тег',
    tagPlaceholder: 'Введите жанр или тег',
    loadingTags: 'Загрузка тегов...',
    noMatchingTags: 'Подходящие теги не найдены',

    hideBroken: 'Скрывать неработающие станции',
    clearFilters: 'Очистить фильтры',
    activeFiltersAriaLabel: 'Активные фильтры',
    removeCountryFilter: 'Убрать фильтр страны',
    removeLanguageFilter: 'Убрать фильтр языка',
    removeTagFilter: 'Убрать фильтр тега',
    resetHideBrokenFilter: 'Сбросить фильтр неработающих станций',
    brokenStationsVisible: 'Неработающие станции показаны',

    resultsFor: 'Результаты для',
    includingBroken: 'включая неработающие',
    station: 'станция',
    stations: 'станций',

    loadingError: 'Ошибка загрузки',
    emptyFiltered: 'Станции по текущим параметрам не найдены',
    emptyDefault: 'Станции не найдены',
  },

  favoritesPage: {
    title: 'Избранное',
    description: 'Ваши сохранённые радиостанции',
    empty: 'У вас пока нет избранных станций',
    savedCount: 'Сохранено станций',
  },

  similarStations: {
    title: 'Похожие станции',
    error: 'Не удалось загрузить похожие станции',
  },

  stationPage: {
    back: 'Назад',
    metadata: 'Информация о станции',
    country: 'Страна',
    language: 'Язык',
    bitrate: 'Битрейт',
    codec: 'Кодек',
    clicks: 'Клики',
    votes: 'Голоса',
    tags: 'Теги',
    tagsEmpty: 'У станции не указаны теги',
    stationNotFound: 'Станция не найдена',
    loadingError: 'Ошибка загрузки станции',
  },

  languageSwitcher: {
    ariaLabel: 'Переключатель языка',
  },

  themeSwitcher: {
    ariaLabel: 'Переключатель темы',
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Система',
  },

  toast: {
    close: 'Закрыть уведомление',
  },
} as const satisfies Translation;
