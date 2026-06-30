import { contextBridge, ipcRenderer } from 'electron';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PASSKEY_CHANNELS } from '../../shared/ipc';
import { setupPasskeysPreload } from '../preload';

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
  },
}));

describe('setupPasskeysPreload', () => {
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

  it('exposes the passkey bridge through contextBridge when context isolation is enabled', () => {
    setupPasskeysPreload();

    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('__clerk_internal_electron_passkeys', {
      create: expect.any(Function),
      get: expect.any(Function),
      capabilities: expect.any(Function),
      electronMajor: expect.any(Number),
      platform: process.platform,
    });
  });

  it('exposes the passkey bridge on window when context isolation is disabled', () => {
    Object.defineProperty(process, 'contextIsolated', { configurable: true, value: false });

    setupPasskeysPreload();

    expect(window.__clerk_internal_electron_passkeys).toEqual({
      create: expect.any(Function),
      get: expect.any(Function),
      capabilities: expect.any(Function),
      electronMajor: expect.any(Number),
      platform: process.platform,
    });
  });

  it('forwards passkey calls over IPC', async () => {
    setupPasskeysPreload();

    const bridge = vi.mocked(contextBridge.exposeInMainWorld).mock.calls[0][1] as NonNullable<
      typeof window.__clerk_internal_electron_passkeys
    >;

    const createOptions = { challenge: 'abc' };
    const getOptions = { challenge: 'def', rpId: 'example.com' };

    await bridge.create(createOptions as never);
    await bridge.get(getOptions as never);
    await bridge.capabilities();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(PASSKEY_CHANNELS.create, createOptions);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(PASSKEY_CHANNELS.get, getOptions);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(PASSKEY_CHANNELS.capabilities);
  });

  it('reports the Electron major version', () => {
    setupPasskeysPreload();

    const bridge = vi.mocked(contextBridge.exposeInMainWorld).mock.calls[0][1] as NonNullable<
      typeof window.__clerk_internal_electron_passkeys
    >;

    const expected = Number.parseInt(process.versions.electron ?? '', 10) || 0;
    expect(bridge.electronMajor).toBe(expected);
  });
});
