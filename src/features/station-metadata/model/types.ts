export type StationNowPlaying = {
  title: string;
  artist: string | null;
  rawTitle: string;
  updatedAt: string | null;
};

export type StationTrackHistoryItem = {
  title: string;
  playedAt: string | null;
};

export type StationMetadataSource =
  | 'azuracast-nowplaying'
  | 'icecast-status-json'
  | 'shoutcast-stats-json'
  | 'shoutcast-current-song'
  | 'shoutcast-played-html';

export type StationMetadataResult = {
  nowPlaying: StationNowPlaying | null;
  history: StationTrackHistoryItem[];
  source: StationMetadataSource;
};

export type StationMetadataAdapterInput = {
  candidateUrl: string;
  contentType: string;
  body: string;
  streamUrl: string;
};

export type StationMetadataTransport =
  | {
      type: 'direct';
      requestUrl: string;
    }
  | {
      type: 'proxy';
      proxyId: string;
      proxyName: string;
      requestUrl: string;
    };

export type StationMetadataCandidateRequest = {
  candidateUrl: string;
  transport: StationMetadataTransport;
};

export type StationMetadataStatus = 'found' | 'not-found' | 'temporary-failure';

export type StationMetadataQueryResult = {
  status: StationMetadataStatus;
  metadata: StationMetadataResult | null;
};

export type StationMetadataCandidateFetchResult =
  | {
      status: 'success';
      input: StationMetadataAdapterInput;
    }
  | {
      status: 'not-found';
    }
  | {
      status: 'temporary-failure';
    };
