export const TOKEN_CACHE_CHANNELS = {
  getToken: 'clerk:token-cache:get',
  saveToken: 'clerk:token-cache:save',
  clearToken: 'clerk:token-cache:clear',
} as const;

export const OAUTH_TRANSPORT_CHANNELS = {
  getRedirectUrl: 'clerk:oauth-transport:get-redirect-url',
  open: 'clerk:oauth-transport:open',
} as const;
