import { app, ipcMain, protocol, shell } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OAUTH_TRANSPORT_CHANNELS, PASSKEY_CHANNELS } from '../../shared/ipc';
import type { TokenStorage } from '../../shared/types';
import { createClerkBridge } from '../create-clerk-bridge';

vi.mock('electron', () => ({
  app: {
    on: vi.fn(),
    removeListener: vi.fn(),
    setAsDefaultProtocolClient: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  protocol: {
    registerSchemesAsPrivileged: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

vi.mock('@clerk/electron-passkeys', () => ({
  default: {
    isAvailable: () => true,
    capabilities: () => ({ platformAuthenticator: true, securityKeys: true }),
    createCredential: vi.fn(),
    getCredential: vi.fn(),
  },
}));

describe('createClerkBridge', () => {
  const missingStorage = {} as Parameters<typeof createClerkBridge>[0];
  const storage: TokenStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a storage adapter', () => {
    expect(() => createClerkBridge(missingStorage)).toThrow('createClerkBridge requires a storage adapter');
  });

  it('sets up token persistence IPC handlers with the provided storage', () => {
    createClerkBridge({ storage });

    expect(ipcMain.handle).toHaveBeenCalledTimes(3);
  });

  it('registers the configured renderer scheme as privileged before app ready', () => {
    createClerkBridge({
      storage,
      renderer: {
        host: 'renderer',
        scheme: 'my-app',
      },
    });

    expect(protocol.registerSchemesAsPrivileged).toHaveBeenCalledWith([
      {
        scheme: 'my-app',
        privileges: {
          corsEnabled: true,
          secure: true,
          standard: true,
          stream: true,
          supportFetchAPI: true,
        },
      },
    ]);
  });

  it('requires renderer.scheme to be a scheme name, not a URL', () => {
    expect(() =>
      createClerkBridge({
        storage,
        renderer: {
          host: 'renderer',
          scheme: 'my-app://',
        },
      }),
    ).toThrow('renderer.scheme must be a scheme name');
  });

  it('requires renderer.host to be a host name, not an origin', () => {
    expect(() =>
      createClerkBridge({
        storage,
        renderer: {
          host: 'my-app://renderer',
          scheme: 'my-app',
        },
      }),
    ).toThrow('renderer.host must be a host name');
  });

  it('returns a cleanup function for registered handlers', () => {
    const clerk = createClerkBridge({ storage });

    clerk.cleanup();

    expect(ipcMain.removeHandler).toHaveBeenCalledTimes(3);
  });

  it('does not register passkey IPC handlers by default', () => {
    createClerkBridge({ storage });

    const channels = vi.mocked(ipcMain.handle).mock.calls.map(([channel]) => channel);
    expect(channels).not.toContain(PASSKEY_CHANNELS.create);
    expect(channels).not.toContain(PASSKEY_CHANNELS.get);
    expect(channels).not.toContain(PASSKEY_CHANNELS.capabilities);
  });

  it('registers passkey IPC handlers when passkeys are enabled', () => {
    createClerkBridge({ storage, passkeys: true });

    const channels = vi.mocked(ipcMain.handle).mock.calls.map(([channel]) => channel);
    expect(channels).toContain(PASSKEY_CHANNELS.create);
    expect(channels).toContain(PASSKEY_CHANNELS.get);
    expect(channels).toContain(PASSKEY_CHANNELS.capabilities);
  });

  it('cleans up passkey handlers together with the token handlers', () => {
    const clerk = createClerkBridge({ storage, passkeys: true });

    clerk.cleanup();

    expect(ipcMain.removeHandler).toHaveBeenCalledTimes(6);
  });

  it('cleans up OAuth transport handlers when renderer origin is configured', () => {
    const clerk = createClerkBridge({
      storage,
      renderer: {
        host: 'renderer',
        scheme: 'my-app',
      },
    });

    clerk.cleanup();

    expect(ipcMain.removeHandler).toHaveBeenCalledWith(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl);
    expect(ipcMain.removeHandler).toHaveBeenCalledWith(OAUTH_TRANSPORT_CHANNELS.open);
    expect(app.removeListener).toHaveBeenCalledWith('open-url', expect.any(Function));
    expect(app.removeListener).toHaveBeenCalledWith('second-instance', expect.any(Function));
  });

  it('sets up OAuth transport IPC handlers when renderer origin is configured', () => {
    createClerkBridge({
      storage,
      renderer: {
        host: 'renderer',
        scheme: 'my-app',
      },
    });

    expect(ipcMain.handle).toHaveBeenCalledWith(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl, expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith(OAUTH_TRANSPORT_CHANNELS.open, expect.any(Function));
    expect(app.setAsDefaultProtocolClient).toHaveBeenCalledWith('my-app');
  });

  it('derives the OAuth callback URL from the renderer origin', () => {
    createClerkBridge({
      storage,
      renderer: {
        host: 'renderer',
        scheme: 'my-app',
      },
    });

    const getRedirectUrlHandler = vi.mocked(ipcMain.handle).mock.calls.find(([channel]) => {
      return channel === OAUTH_TRANSPORT_CHANNELS.getRedirectUrl;
    })?.[1];

    expect(getRedirectUrlHandler?.({} as Electron.IpcMainInvokeEvent)).toBe('my-app://renderer/');
  });

  it('opens OAuth URLs externally and resolves with the matching deep-link callback URL', async () => {
    vi.mocked(shell.openExternal).mockResolvedValue(undefined);
    createClerkBridge({
      storage,
      renderer: {
        host: 'renderer',
        scheme: 'my-app',
      },
    });

    const openHandler = vi.mocked(ipcMain.handle).mock.calls.find(([channel]) => {
      return channel === OAUTH_TRANSPORT_CHANNELS.open;
    })?.[1];
    const openPromise = openHandler?.({} as Electron.IpcMainInvokeEvent, 'https://accounts.example.com/oauth');
    const openUrlListener = vi.mocked(app.on).mock.calls.find(([event]) => event === 'open-url')?.[1] as (
      event: Electron.Event,
      url: string,
    ) => void;

    openUrlListener({ preventDefault: vi.fn() } as unknown as Electron.Event, 'my-app://renderer/?code=123');

    await expect(openPromise).resolves.toEqual({ callbackUrl: 'my-app://renderer/?code=123' });
    expect(shell.openExternal).toHaveBeenCalledWith('https://accounts.example.com/oauth');
  });
});
