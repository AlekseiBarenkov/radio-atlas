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

    close: 'Закрыть',
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
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
  },

  recentlyPlayed: {
    title: 'Недавно слушали',
    description: 'Станции, которые вы недавно запускали',
    empty: 'Нет недавно прослушанных станций',
    clear: 'Очистить историю',
  },

  miniPlayer: {
    stop: 'Стоп',
    volume: 'Громкость',
  },

  favorites: {
    add: 'Добавить в избранное',
    remove: 'Удалить из избранного',
    addedToast: 'Добавлено в избранное',
    removedToast: 'Удалено из избранного',
  },

  player: {
    play: 'Играть',
    loading: 'Загрузка...',
    buffering: 'Буферизация...',
    resume: 'Продолжить',
    pause: 'Пауза',
    retry: 'Повторить',

    connecting: 'Подключение к станции...',
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
    nowPlaying: 'Сейчас играет',
    recentlyPlayedTracks: 'Недавние треки',
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

  proxySettings: {
    title: 'Прокси',
    description: 'Управление HTTP stream proxy для заблокированных радиопотоков',
    navLabel: 'Прокси',
    addProxy: 'Добавить прокси',
    updateProxy: 'Сохранить',
    removeProxy: 'Удалить',
    empty: 'Прокси пока не добавлены',
    name: 'Название',
    host: 'Хост',
    port: 'Порт',
    token: 'Ключ',
    enabled: 'Включен',
    disabled: 'Отключен',
    newProxyName: 'Новый прокси',
    hostPlaceholder: 'https://proxy.domain.com',
    portPlaceholder: '3000',
    tokenPlaceholder: 'Ключ',
    validationError: 'Проверьте настройки прокси',
    nameRequired: 'Введите название прокси',
    hostRequired: 'Введите хост прокси',
    hostInvalid: 'Хост должен начинаться с http:// или https://',
    hostMixedContent:
      'HTTP-прокси нельзя использовать из HTTPS-приложения. Используйте HTTPS-прокси или настройте HTTPS reverse proxy.',
    portInvalid: 'Порт должен быть числом от 1 до 65535',
    editProxy: 'Редактировать',
    enableProxy: 'Включить прокси',
    disableProxy: 'Отключить прокси',
    proxyActive: 'Используется прокси',
    deleteProxyTitle: 'Удалить прокси',
    deleteProxyDescription: 'Прокси будет удален.',
    cancel: 'Отмена',
    proxyAvailable: 'Прокси доступен',
    proxyUnavailable: 'Прокси недоступен',
    proxyUnchecked: 'Прокси не проверен',
    checkProxy: 'Проверить прокси',
    radioBrowserProxyActive: 'Radio Browser API',
    radioBrowserProxyEnabled: 'Radio Browser переключен на прокси',
    proxyRadioBrowserRequests: 'Проксировать запросы Radio Browser',
    proxyRadioBrowserRequestsDescription: 'Включённые прокси используются по очереди, затем выполняется прямой запрос.',
  },
  settings: {
    title: 'Настройки',
    description: 'Управление настройками приложения и синхронизацией',
    navLabel: 'Настройки',
  },

  syncSettings: {
    title: 'Облачная синхронизация',
    selectProviderFirst: 'Выберите облачное хранилище, чтобы подключить синхронизацию.',
    description: 'Синхронизация избранного и настроек прокси через один облачный провайдер.',
    provider: 'Провайдер',
    noProvider: 'Не подключено',
    automaticSync: 'Автоматическая синхронизация',
    autoSyncDisabledUntilFirstSync: 'Сначала синхронизируйте или восстановите бэкап',
    syncNow: 'Синхронизировать',
    connect: 'Подключить',
    lastSyncedAt: 'Последняя успешная синхронизация',
    neverSynced: 'Еще не синхронизировалось',
    status: 'Статус',
    syncStatus: 'Состояние данных',
    idle: 'Не синхронизировано',
    syncing: 'Синхронизация',
    synced: 'Синхронизировано',
    failed: 'Ошибка синхронизации',
    conflict: 'Требуется действие',
    conflictDescription: 'Локальные данные и бэкап изменились после последней успешной синхронизации.',
    useLocalData: 'Использовать локальные данные',
    useBackupData: 'Использовать бэкап',
    restoreBackup: 'Восстановить из бэкапа',
    syncFailed: 'Ошибка синхронизации',
    restoreFailed: 'Не удалось восстановить бэкап',
    backupNotFound: 'Бэкап не найден',
    restoreBackupTitle: 'Восстановить бэкап',
    restoreBackupDescription: 'Избранное и настройки прокси на этом устройстве будут заменены данными из бэкапа.',
    cancel: 'Отмена',
    confirmRestore: 'Восстановить',
    googleClientIdMissing: 'Google Client ID не настроен',
    googleAuthFailed: 'Не удалось авторизоваться в Google',
    yandexClientIdMissing: 'Yandex Client ID не настроен',
    yandexAuthFailed: 'Не удалось авторизоваться в Yandex',
    connectAndSync: 'Подключить и синхронизировать',
    readyToConnect: 'Готово к подключению',
    connected: 'Подключено',
    connecting: 'Подключение',
    connectionFailed: 'Ошибка подключения',
  },
} as const satisfies Translation;
