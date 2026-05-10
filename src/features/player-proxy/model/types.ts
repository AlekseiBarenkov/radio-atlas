export type UserProxy = {
  id: string;
  name: string;
  host: string;
  port: number | null;
  token: string;
  enabled: boolean;
  priority: number;
  successCount: number;
  failureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
};

export type UserProxyInput = {
  name: string;
  host: string;
  port: number | null;
  token: string;
  enabled: boolean;
};

export type PlaybackFailReason = 'startup-failed' | 'runtime-interruption';

export type PlayerProxyState = {
  proxies: UserProxy[];
  activeProxyId: string | null;
};

export type PlayerProxyActions = {
  addProxy: (input: UserProxyInput) => void;
  updateProxy: (proxyId: string, input: UserProxyInput) => void;
  removeProxy: (proxyId: string) => void;
  markProxySuccess: (proxyId: string) => void;
  markProxyFailure: (proxyId: string) => void;
  toggleProxyEnabled: (proxyId: string) => void;
  setActiveProxyId: (proxyId: string | null) => void;
};

export type PlayerProxyStore = PlayerProxyState & {
  actions: PlayerProxyActions;
};
