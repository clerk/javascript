import { ipcMain, protocol } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TokenStorage } from '../../shared/types';
import { setupMain } from '../setup-main';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  protocol: {
    registerSchemesAsPrivileged: vi.fn(),
  },
}));

describe('setupMain', () => {
  const missingStorage = {} as Parameters<typeof setupMain>[0];
  const storage: TokenStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a storage adapter', () => {
    expect(() => setupMain(missingStorage)).toThrow('setupMain requires a storage adapter');
  });

  it('sets up token persistence IPC handlers with the provided storage', () => {
    setupMain({ storage });

    expect(ipcMain.handle).toHaveBeenCalledTimes(3);
  });

  it('registers the configured renderer scheme as privileged before app ready', () => {
    setupMain({
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
      setupMain({
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
      setupMain({
        storage,
        renderer: {
          host: 'my-app://renderer',
          scheme: 'my-app',
        },
      }),
    ).toThrow('renderer.host must be a host name');
  });

  it('returns a cleanup function for registered handlers', () => {
    const clerk = setupMain({ storage });

    clerk.cleanup();

    expect(ipcMain.removeHandler).toHaveBeenCalledTimes(3);
  });
});
