import type { IpcMainInvokeEvent } from 'electron';
import { ipcMain } from 'electron';

import { TOKEN_CACHE_CHANNELS } from '../shared/ipc';
import type { TokenStorage } from '../shared/types';
import { isMainFrameEvent } from './validate-sender';

function assertMainFrameSender(event: IpcMainInvokeEvent): void {
  if (!isMainFrameEvent(event)) {
    throw new Error("Clerk: token-cache request did not originate from a window's main frame.");
  }
}

export function setupTokenCacheIpcHandlers(storage: TokenStorage): () => void {
  ipcMain.handle(TOKEN_CACHE_CHANNELS.getToken, (event, key: string) => {
    assertMainFrameSender(event);
    return storage.getItem(key);
  });

  ipcMain.handle(TOKEN_CACHE_CHANNELS.saveToken, (event, key: string, value: string) => {
    assertMainFrameSender(event);
    return storage.setItem(key, value);
  });

  ipcMain.handle(TOKEN_CACHE_CHANNELS.clearToken, (event, key: string) => {
    assertMainFrameSender(event);
    return storage.removeItem(key);
  });

  return () => {
    ipcMain.removeHandler(TOKEN_CACHE_CHANNELS.getToken);
    ipcMain.removeHandler(TOKEN_CACHE_CHANNELS.saveToken);
    ipcMain.removeHandler(TOKEN_CACHE_CHANNELS.clearToken);
  };
}
