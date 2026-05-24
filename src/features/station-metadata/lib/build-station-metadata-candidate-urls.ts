export const buildStationMetadataCandidateUrls = (streamUrl: string): string[] => {
  const url = new URL(streamUrl);
  const baseUrl = url.origin;

  const candidates = [
    '/status-json.xsl',
    '/stats?sid=1&json=1',
    '/currentsong?sid=1',
    '/played.html?sid=1',
    '/api/nowplaying',
    '/api/nowplaying/1',
  ];

  return Array.from(new Set(candidates.map((candidate) => `${baseUrl}${candidate}`)));
};
