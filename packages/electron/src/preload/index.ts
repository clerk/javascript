import { contextBridge, ipcRenderer } from 'electron';

import { TOKEN_CACHE_CHANNELS } from '../shared/ipc';
import type { TokenCache } from '../shared/types';

export function setupPreload(): void {
  const tokenCache: TokenCache = {
    getToken: key => ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.getToken, key),
    saveToken: (key, value) => ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.saveToken, key, value),
    clearToken: key => ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.clearToken, key),
  };

  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('__clerk_internal_electron', { tokenCache });
  } else {
    window.__clerk_internal_electron = { tokenCache };
  }
}
