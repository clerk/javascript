import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkRuntimeError } from '../errors/clerkRuntimeError';
import { getToken } from '../getToken';

type StatusHandler = (status: string) => void;

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

  describe('when Clerk is loading', () => {
    it('should wait for ready status via event listener', async () => {
      const mockToken = 'delayed-token';
      let statusHandler: StatusHandler | null = null;

      const mockClerk = {
        status: 'loading' as string,
        on: vi.fn((event: string, handler: StatusHandler) => {
          if (event === 'status') {
            statusHandler = handler;
          }
        }),
        off: vi.fn(),
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      const tokenPromise = getToken();

      // Simulate Clerk becoming ready
      await vi.advanceTimersByTimeAsync(100);
      mockClerk.status = 'ready';
      if (statusHandler) {
        (statusHandler as StatusHandler)('ready');
      }

      const token = await tokenPromise;
      expect(token).toBe(mockToken);
    });

    it('should resolve when status changes to degraded', async () => {
      const mockToken = 'degraded-token';
      let statusHandler: StatusHandler | null = null;

      const mockClerk = {
        status: 'loading' as string,
        on: vi.fn((event: string, handler: StatusHandler) => {
          if (event === 'status') {
            statusHandler = handler;
          }
        }),
        off: vi.fn(),
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      const tokenPromise = getToken();

      // Simulate Clerk becoming degraded
      await vi.advanceTimersByTimeAsync(100);
      mockClerk.status = 'degraded';
      if (statusHandler) {
        (statusHandler as StatusHandler)('degraded');
      }

      const token = await tokenPromise;
      expect(token).toBe(mockToken);
    });
  });

  describe('when window.Clerk does not exist', () => {
    it('should poll until Clerk is available', async () => {
      const mockToken = 'polled-token';

      global.window = {} as any;

      const tokenPromise = getToken();

      // Simulate Clerk loading after 200ms
      await vi.advanceTimersByTimeAsync(200);

      (global.window as any).Clerk = {
        status: 'ready',
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      await vi.advanceTimersByTimeAsync(100);

      const token = await tokenPromise;
      expect(token).toBe(mockToken);
    });

    it('should throw ClerkRuntimeError if Clerk never loads', async () => {
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

  describe('when Clerk enters error status', () => {
    it('should throw ClerkRuntimeError', async () => {
      let statusHandler: StatusHandler | null = null;

      const mockClerk = {
        status: 'loading' as string,
        on: vi.fn((event: string, handler: StatusHandler) => {
          if (event === 'status') {
            statusHandler = handler;
          }
        }),
        off: vi.fn(),
        session: null,
      };

      global.window = { Clerk: mockClerk } as any;

      const tokenPromise = getToken();

      // Simulate Clerk entering error state
      await vi.advanceTimersByTimeAsync(100);
      mockClerk.status = 'error';
      if (statusHandler) {
        (statusHandler as StatusHandler)('error');
      }

      await expect(tokenPromise).rejects.toThrow(ClerkRuntimeError);
      await expect(tokenPromise).rejects.toMatchObject({
        code: 'clerk_runtime_init_error',
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

  describe('cleanup', () => {
    it('should unsubscribe from status listener on success', async () => {
      const mockToken = 'cleanup-token';
      let statusHandler: StatusHandler | null = null;

      const mockClerk = {
        status: 'loading' as string,
        on: vi.fn((event: string, handler: StatusHandler) => {
          if (event === 'status') {
            statusHandler = handler;
          }
        }),
        off: vi.fn(),
        session: {
          getToken: vi.fn().mockResolvedValue(mockToken),
        },
      };

      global.window = { Clerk: mockClerk } as any;

      const tokenPromise = getToken();

      await vi.advanceTimersByTimeAsync(50);
      mockClerk.status = 'ready';
      if (statusHandler) {
        (statusHandler as StatusHandler)('ready');
      }

      await tokenPromise;

      // Verify cleanup was called
      expect(mockClerk.off).toHaveBeenCalledWith('status', statusHandler);
    });
  });
});
