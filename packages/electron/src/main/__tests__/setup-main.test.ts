import { ipcMain } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TokenStorage } from '../../shared/types';
import { setupMain } from '../setup-main';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
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

  it('returns a cleanup function for registered handlers', () => {
    const clerk = setupMain({ storage });

    clerk.cleanup();

    expect(ipcMain.removeHandler).toHaveBeenCalledTimes(3);
  });
});
