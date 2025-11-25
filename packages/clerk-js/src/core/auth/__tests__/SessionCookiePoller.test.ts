import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SafeLockReturn } from '../safeLock';
import { SessionCookiePoller } from '../SessionCookiePoller';

describe('SessionCookiePoller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('shared lock coordination', () => {
    it('accepts an external lock for coordination with other components', () => {
      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockResolvedValue(undefined),
      };

      const poller = new SessionCookiePoller(sharedLock);
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);

      // Verify the shared lock is used
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledWith(callback);

      poller.stopPollingForSessionToken();
    });

    it('creates internal lock when none provided (backward compatible)', () => {
      // Should not throw when no lock is provided
      const poller = new SessionCookiePoller();
      expect(poller).toBeInstanceOf(SessionCookiePoller);
    });

    it('enables focus handler and poller to share the same lock', () => {
      // This test demonstrates the shared lock pattern used in AuthCookieService
      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockImplementation(async (cb: () => Promise<unknown>) => {
          return cb();
        }),
      };

      const poller = new SessionCookiePoller(sharedLock);
      const pollerCallback = vi.fn().mockResolvedValue('poller-result');

      // Poller uses the shared lock
      poller.startPollingForSessionToken(pollerCallback);

      // Simulate focus handler also using the shared lock (like AuthCookieService does)
      const focusCallback = vi.fn().mockResolvedValue('focus-result');
      void sharedLock.acquireLockAndRun(focusCallback);

      // Both should use the same lock instance
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledTimes(2);
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledWith(pollerCallback);
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledWith(focusCallback);

      poller.stopPollingForSessionToken();
    });
  });

  describe('startPollingForSessionToken', () => {
    it('executes callback immediately on start', () => {
      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockResolvedValue(undefined),
      };

      const poller = new SessionCookiePoller(sharedLock);
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);

      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledWith(callback);

      poller.stopPollingForSessionToken();
    });

    it('prevents multiple concurrent polling sessions', () => {
      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockResolvedValue(undefined),
      };

      const poller = new SessionCookiePoller(sharedLock);
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);
      poller.startPollingForSessionToken(callback); // Second call should be ignored

      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledTimes(1);

      poller.stopPollingForSessionToken();
    });
  });

  describe('stopPollingForSessionToken', () => {
    it('allows restart after stop', async () => {
      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockResolvedValue(undefined),
      };

      const poller = new SessionCookiePoller(sharedLock);
      const callback = vi.fn().mockResolvedValue(undefined);

      // Start and stop
      poller.startPollingForSessionToken(callback);
      poller.stopPollingForSessionToken();

      // Clear mock to check restart
      vi.mocked(sharedLock.acquireLockAndRun).mockClear();

      // Should be able to start again
      poller.startPollingForSessionToken(callback);
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledTimes(1);

      poller.stopPollingForSessionToken();
    });
  });

  describe('polling interval', () => {
    it('schedules next poll after callback completes', async () => {
      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockResolvedValue(undefined),
      };

      const poller = new SessionCookiePoller(sharedLock);
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);

      // Initial call
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledTimes(1);

      // Wait for first interval (5 seconds)
      await vi.advanceTimersByTimeAsync(5000);

      // Should have scheduled another call
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledTimes(2);

      poller.stopPollingForSessionToken();
    });
  });
});
