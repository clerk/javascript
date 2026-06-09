import { contextBridge, ipcRenderer } from 'electron';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TOKEN_CACHE_CHANNELS } from '../../shared/ipc';
import { setupPreload } from '../index';

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
  },
}));

describe('setupPreload', () => {
  const originalContextIsolated = process.contextIsolated;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(process, 'contextIsolated', { configurable: true, value: true });
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  afterAll(() => {
    Object.defineProperty(process, 'contextIsolated', { configurable: true, value: originalContextIsolated });
  });

  it('exposes the Clerk Electron bridge through contextBridge when context isolation is enabled', () => {
    setupPreload();

    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('__clerk_internal_electron', {
      tokenCache: {
        getToken: expect.any(Function),
        saveToken: expect.any(Function),
        clearToken: expect.any(Function),
      },
    });
  });

  it('exposes the Clerk Electron bridge on window when context isolation is disabled', () => {
    Object.defineProperty(process, 'contextIsolated', { configurable: true, value: false });

    setupPreload();

    expect(window.__clerk_internal_electron?.tokenCache).toEqual({
      getToken: expect.any(Function),
      saveToken: expect.any(Function),
      clearToken: expect.any(Function),
    });
  });

  it('forwards token cache calls over IPC', async () => {
    setupPreload();

    const bridge = vi.mocked(contextBridge.exposeInMainWorld).mock
      .calls[0][1] as typeof window.__clerk_internal_electron;

    await bridge?.tokenCache.getToken('token-key');
    await bridge?.tokenCache.saveToken('token-key', 'jwt');
    await bridge?.tokenCache.clearToken('token-key');

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.getToken, 'token-key');
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.saveToken, 'token-key', 'jwt');
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(TOKEN_CACHE_CHANNELS.clearToken, 'token-key');
  });
});
