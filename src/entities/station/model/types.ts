export type RadioStation = {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  languagecodes: string;
  votes: number;
  codec: string;
  bitrate: number;
  clickcount: number;
  hls: number;
  lastcheckok: number;
};

export type GetTopClickStationsParams = {
  limit?: number;
  hideBroken?: boolean;
};
