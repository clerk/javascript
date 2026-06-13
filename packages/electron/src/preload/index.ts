import { contextBridge, ipcRenderer } from 'electron';

import { OAUTH_TRANSPORT_CHANNELS, TOKEN_CACHE_CHANNELS } from '../shared/ipc';
import type { OAuthTransport, TokenCache } from '../shared/types';

export function setupPreload(): void {
  const tokenCache: TokenCache = {
    getToken: key => ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.getToken, key),
    saveToken: (key, value) => ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.saveToken, key, value),
    clearToken: key => ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.clearToken, key),
  };
  const oauthTransport: OAuthTransport = {
    getRedirectUrl: () => ipcRenderer.invoke(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl),
    open: url => ipcRenderer.invoke(OAUTH_TRANSPORT_CHANNELS.open, url),
  };
  const bridge = { tokenCache, oauthTransport };

  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('__clerk_internal_electron', bridge);
  } else {
    window.__clerk_internal_electron = bridge;
  }
}
