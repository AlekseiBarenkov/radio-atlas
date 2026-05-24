type IcecastStatusJson = {
  icestats?: {
    source?: IcecastSource | IcecastSource[];
  };
};

type IcecastSource = {
  listenurl?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getString = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

const parseJson = (body: string): IcecastStatusJson | null => {
  try {
    const parsed = JSON.parse(body);

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const getSources = (json: IcecastStatusJson): IcecastSource[] => {
  const source = json.icestats?.source;

  if (!source) {
    return [];
  }

  return Array.isArray(source) ? source : [source];
};

const getAzuraCastStationShortcode = (listenUrl: string): string | null => {
  try {
    const url = new URL(listenUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    const listenIndex = parts.indexOf('listen');
    const shortcode = listenIndex >= 0 ? parts[listenIndex + 1] : null;

    return shortcode && shortcode.length > 0 ? shortcode : null;
  } catch {
    return null;
  }
};

const buildAzuraCastUrls = (listenUrl: string): string[] => {
  try {
    const url = new URL(listenUrl);
    const shortcode = getAzuraCastStationShortcode(listenUrl);

    if (!shortcode) {
      return [];
    }

    const baseUrl = url.origin;

    return [`${baseUrl}/api/nowplaying/${shortcode}`, `${baseUrl}/api/nowplaying_static/${shortcode}.json`];
  } catch {
    return [];
  }
};

export const buildAzuraCastCandidateUrlsFromIcecast = (body: string): string[] => {
  const json = parseJson(body);

  if (!json) {
    return [];
  }

  const urls = getSources(json).flatMap((source) => {
    const listenUrl = getString(source.listenurl);

    return listenUrl ? buildAzuraCastUrls(listenUrl) : [];
  });

  return Array.from(new Set(urls));
};
