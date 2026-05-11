export type UserProxy = {
  id: string;
  name: string;
  host: string;
  port: number | null;
  token: string;
  enabled: boolean;
  availability?: boolean;
};

export type UserProxyInput = {
  name: string;
  host: string;
  port: number | null;
  token: string;
  enabled: boolean;
};

export type PlayerProxyState = {
  proxies: UserProxy[];
  activeProxyId: string | null;
};

export type PlayerProxyActions = {
  addProxy: (input: UserProxyInput) => void;
  updateProxy: (proxyId: string, input: UserProxyInput) => void;
  removeProxy: (proxyId: string) => void;
  toggleProxyEnabled: (proxyId: string) => void;
  setActiveProxyId: (proxyId: string | null) => void;
  setProxyAvailability: (proxyId: string, availability?: boolean) => void;
  checkProxy: (proxyId: string) => Promise<void>;
};

export type PlayerProxyStore = PlayerProxyState & {
  actions: PlayerProxyActions;
};
