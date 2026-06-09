import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TokenStorage } from '../../shared/types';
import { setupTokenCacheIpcHandlers } from '../ipc-handlers';
import { setupMain } from '../setup-main';

vi.mock('../ipc-handlers', () => ({
  setupTokenCacheIpcHandlers: vi.fn(),
}));

describe('setupMain', () => {
  const cleanupTokenCacheIpcHandlers = vi.fn();
  const storage: TokenStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setupTokenCacheIpcHandlers).mockReturnValue(cleanupTokenCacheIpcHandlers);
  });

  it('requires a storage adapter', () => {
    expect(() => setupMain({} as any)).toThrow('setupMain requires a storage adapter');
  });

  it('sets up token persistence IPC handlers with the provided storage', () => {
    setupMain({ storage });

    expect(setupTokenCacheIpcHandlers).toHaveBeenCalledWith(storage);
  });

  it('returns a cleanup function for registered handlers', () => {
    const clerk = setupMain({ storage });

    clerk.cleanup();

    expect(cleanupTokenCacheIpcHandlers).toHaveBeenCalled();
  });
});
