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
    emptyTitle: 'Ничего не играет',
    chooseStation: 'Выберите радиостанцию',
    continuePrefix: 'Продолжить',
    continueListening: 'Продолжить',
    stop: 'Стоп',
  },

  favorites: {
    add: 'Добавить в избранное',
    remove: 'Удалить из избранного',
    inFavorites: 'В избранном',
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
    playbackError: 'Ошибка воспроизведения',
  },

  discover: {
    title: 'Поиск станций',
    description: 'Расширенный список станций из Radio Browser',
  },
} as const satisfies Translation;
