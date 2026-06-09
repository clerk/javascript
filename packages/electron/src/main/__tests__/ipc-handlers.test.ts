import { ipcMain } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TOKEN_CACHE_CHANNELS } from '../../shared/ipc';
import type { TokenStorage } from '../../shared/types';
import { setupTokenCacheIpcHandlers } from '../ipc-handlers';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

describe('setupTokenCacheIpcHandlers', () => {
  const storage: TokenStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers token cache IPC handlers', () => {
    setupTokenCacheIpcHandlers(storage);

    expect(ipcMain.handle).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.getToken, expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.saveToken, expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.clearToken, expect.any(Function));
  });

  it('delegates token operations to the storage adapter', async () => {
    vi.mocked(storage.getItem).mockResolvedValue('jwt');

    setupTokenCacheIpcHandlers(storage);

    const getTokenHandler = vi.mocked(ipcMain.handle).mock.calls[0][1];
    const saveTokenHandler = vi.mocked(ipcMain.handle).mock.calls[1][1];
    const clearTokenHandler = vi.mocked(ipcMain.handle).mock.calls[2][1];

    await expect(getTokenHandler({} as any, 'token-key')).resolves.toBe('jwt');
    await saveTokenHandler({} as any, 'token-key', 'jwt');
    await clearTokenHandler({} as any, 'token-key');

    expect(storage.getItem).toHaveBeenCalledWith('token-key');
    expect(storage.setItem).toHaveBeenCalledWith('token-key', 'jwt');
    expect(storage.removeItem).toHaveBeenCalledWith('token-key');
  });

  it('removes registered handlers on cleanup', () => {
    const cleanup = setupTokenCacheIpcHandlers(storage);

    cleanup();

    expect(ipcMain.removeHandler).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.getToken);
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.saveToken);
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.clearToken);
  });
});
