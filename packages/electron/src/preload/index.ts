import { contextBridge, ipcRenderer } from 'electron';

import { setupPasskeysPreload } from '../passkeys/preload';
import { OAUTH_TRANSPORT_CHANNELS, TOKEN_CACHE_CHANNELS } from '../shared/ipc';
import type { OAuthTransport, TokenCache } from '../shared/types';

export { setupPasskeysPreload };

/**
 * Exposes Clerk's Electron bridge from the preload script to the renderer.
 *
 * Call this from an Electron preload script. It publishes a narrow internal bridge used by
 * `@clerk/electron/react` for token storage and OAuth transport.
 */
export function exposeClerkBridge(): void {
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
