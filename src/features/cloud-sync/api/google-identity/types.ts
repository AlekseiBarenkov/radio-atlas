export type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

export type GoogleTokenClient = {
  requestAccessToken: () => void;
};

export type GoogleTokenClientConfig = {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
};

export type GoogleAccountsOAuth2 = {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
};

export type GoogleIdentityGlobal = {
  accounts: {
    oauth2: GoogleAccountsOAuth2;
  };
};
