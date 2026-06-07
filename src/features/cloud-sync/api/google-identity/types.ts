export type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

export type GoogleTokenClient = {
  requestAccessToken: () => void;
};

export type GoogleTokenClientError = {
  type: string;
};

export type GoogleTokenClientConfig = {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: GoogleTokenClientError) => void;
};

export type GoogleAccountsOAuth2 = {
  initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
};

export type GoogleIdentityGlobal = {
  accounts: {
    oauth2: GoogleAccountsOAuth2;
  };
};
