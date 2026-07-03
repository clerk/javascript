import { ipcMain } from 'electron';

import { TOKEN_CACHE_CHANNELS } from '../shared/ipc';
import type { TokenStorage } from '../shared/types';

export function setupTokenCacheIpcHandlers(storage: TokenStorage): () => void {
  ipcMain.handle(TOKEN_CACHE_CHANNELS.getToken, (_event, key: string) => {
    return storage.getItem(key);
  });

  ipcMain.handle(TOKEN_CACHE_CHANNELS.saveToken, (_event, key: string, value: string) => {
    return storage.setItem(key, value);
  });

  ipcMain.handle(TOKEN_CACHE_CHANNELS.clearToken, (_event, key: string) => {
    return storage.removeItem(key);
  });

  return () => {
    ipcMain.removeHandler(TOKEN_CACHE_CHANNELS.getToken);
    ipcMain.removeHandler(TOKEN_CACHE_CHANNELS.saveToken);
    ipcMain.removeHandler(TOKEN_CACHE_CHANNELS.clearToken);
  };
}
