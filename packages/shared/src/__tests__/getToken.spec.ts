import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkRuntimeError } from '../errors/clerkRuntimeError';
import { getToken } from '../getToken';

describe('getToken', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.window = originalWindow;
  });

  describe('when Clerk is already ready', () => {
    it('should return token immediately', async () => {
      const mockToken = 'mock-jwt-token';
      const mockClerk = {
        status: 'ready',
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      const token = await getToken();
      expect(token).toBe(mockToken);
      expect(mockClerk.session.getToken).toHaveBeenCalledWith(undefined);
    });

    it('should pass options to session.getToken', async () => {
      const mockClerk = {
        status: 'ready',
        session: {
          getToken: vi.fn().mockResolvedValue('token'),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      await getToken({ template: 'custom-template' });
      expect(mockClerk.session.getToken).toHaveBeenCalledWith({ template: 'custom-template' });
    });

    it('should pass organizationId option to session.getToken', async () => {
      const mockClerk = {
        status: 'ready',
        session: {
          getToken: vi.fn().mockResolvedValue('token'),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      await getToken({ organizationId: 'org_123' });
      expect(mockClerk.session.getToken).toHaveBeenCalledWith({ organizationId: 'org_123' });
    });
  });

  describe('when Clerk is not yet ready', () => {
    it('should wait for promise resolution when clerk-js resolves the global promise', async () => {
      const mockToken = 'delayed-token';
      const mockClerk = {
        status: 'ready',
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      // Start with empty window (no Clerk)
      global.window = {} as any;

      const tokenPromise = getToken();

      // Simulate clerk-js loading and resolving the promise
      await vi.advanceTimersByTimeAsync(100);

      // Resolve the promise that getToken created
      const readyPromise = (global.window as any).__clerk_internal_ready;
      expect(readyPromise).toBeDefined();
      expect(readyPromise.__resolve).toBeDefined();

      // Simulate clerk-js calling __resolve
      readyPromise.__resolve(mockClerk);

      const token = await tokenPromise;
      expect(token).toBe(mockToken);
    });

    it('should resolve when clerk-js resolves with degraded status', async () => {
      const mockToken = 'degraded-token';
      const mockClerk = {
        status: 'degraded',
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = {} as any;

      const tokenPromise = getToken();

      await vi.advanceTimersByTimeAsync(100);

      const readyPromise = (global.window as any).__clerk_internal_ready;
      readyPromise.__resolve(mockClerk);

      const token = await tokenPromise;
      expect(token).toBe(mockToken);
    });

    it('should reject when clerk-js rejects the global promise', async () => {
      global.window = {} as any;

      const tokenPromise = getToken();

      await vi.advanceTimersByTimeAsync(100);

      const readyPromise = (global.window as any).__clerk_internal_ready;
      readyPromise.__reject(new Error('Clerk failed to initialize'));

      await expect(tokenPromise).rejects.toThrow('Clerk failed to initialize');
    });

    it('should throw ClerkRuntimeError if promise is never resolved (timeout)', async () => {
      global.window = {} as any;

      let caughtError: unknown;
      const tokenPromise = getToken().catch(e => {
        caughtError = e;
      });

      // Fast-forward past timeout (10 seconds)
      await vi.advanceTimersByTimeAsync(15000);
      await tokenPromise;

      expect(caughtError).toBeInstanceOf(ClerkRuntimeError);
      expect((caughtError as ClerkRuntimeError).code).toBe('clerk_runtime_load_timeout');
    });
  });

  describe('multiple concurrent getToken calls', () => {
    it('should share the same promise for concurrent calls', async () => {
      const mockToken = 'shared-token';
      const mockClerk = {
        status: 'ready',
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = {} as any;

      const tokenPromise1 = getToken();
      const tokenPromise2 = getToken();
      const tokenPromise3 = getToken();

      await vi.advanceTimersByTimeAsync(100);

      const readyPromise = (global.window as any).__clerk_internal_ready;
      readyPromise.__resolve(mockClerk);

      const [token1, token2, token3] = await Promise.all([tokenPromise1, tokenPromise2, tokenPromise3]);

      expect(token1).toBe(mockToken);
      expect(token2).toBe(mockToken);
      expect(token3).toBe(mockToken);
      expect(mockClerk.session.getToken).toHaveBeenCalledTimes(3);
    });
  });

  describe('when user is not signed in', () => {
    it('should return null when session is null', async () => {
      const mockClerk = {
        status: 'ready',
        session: null,
      };

      global.window = { Clerk: mockClerk } as any;

      const token = await getToken();
      expect(token).toBeNull();
    });

    it('should return null when session is undefined', async () => {
      const mockClerk = {
        status: 'ready',
        session: undefined,
      };

      global.window = { Clerk: mockClerk } as any;

      const token = await getToken();
      expect(token).toBeNull();
    });
  });

  describe('when Clerk status is degraded', () => {
    it('should still return token', async () => {
      const mockToken = 'degraded-token';
      const mockClerk = {
        status: 'degraded',
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      const token = await getToken();
      expect(token).toBe(mockToken);
    });
  });

  describe('in non-browser environment', () => {
    it('should throw ClerkRuntimeError when window is undefined', async () => {
      global.window = undefined as any;

      await expect(getToken()).rejects.toThrow(ClerkRuntimeError);
      await expect(getToken()).rejects.toMatchObject({
        code: 'clerk_runtime_not_browser',
      });
    });
  });

  describe('when session.getToken throws', () => {
    it('should propagate the error', async () => {
      const mockClerk = {
        status: 'ready',
        session: {
          getToken: vi.fn().mockRejectedValue(new Error('Token fetch failed')),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      await expect(getToken()).rejects.toThrow('Token fetch failed');
    });
  });

  describe('fallback for older clerk-js versions', () => {
    it('should resolve when clerk.loaded is true but status is undefined', async () => {
      const mockToken = 'legacy-token';
      const mockClerk = {
        loaded: true,
        status: undefined,
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      const token = await getToken();
      expect(token).toBe(mockToken);
    });
  });
});
