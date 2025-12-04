import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionCookiePoller } from '../SessionCookiePoller';

describe('SessionCookiePoller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('startPollingForSessionToken', () => {
    it('executes callback immediately on start', async () => {
      const poller = new SessionCookiePoller();
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);

      // Flush microtasks to let the async run() execute
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);

      poller.stopPollingForSessionToken();
    });

    it('prevents multiple concurrent polling sessions', async () => {
      const poller = new SessionCookiePoller();
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);
      poller.startPollingForSessionToken(callback); // Second call should be ignored

      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);

      poller.stopPollingForSessionToken();
    });
  });

  describe('stopPollingForSessionToken', () => {
    it('stops polling when called', async () => {
      const poller = new SessionCookiePoller();
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);

      poller.stopPollingForSessionToken();

      // Advance time - callback should not be called again
      await vi.advanceTimersByTimeAsync(10000);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('allows restart after stop', async () => {
      const poller = new SessionCookiePoller();
      const callback = vi.fn().mockResolvedValue(undefined);

      // Start and stop
      poller.startPollingForSessionToken(callback);
      await Promise.resolve();
      poller.stopPollingForSessionToken();

      expect(callback).toHaveBeenCalledTimes(1);

      // Should be able to start again
      poller.startPollingForSessionToken(callback);
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(2);

      poller.stopPollingForSessionToken();
    });
  });

  describe('polling interval', () => {
    it('schedules next poll after callback completes', async () => {
      const poller = new SessionCookiePoller();
      const callback = vi.fn().mockResolvedValue(undefined);

      poller.startPollingForSessionToken(callback);

      // Initial call
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(1);

      // Wait for first interval (5 seconds)
      await vi.advanceTimersByTimeAsync(5000);

      // Should have scheduled another call
      expect(callback).toHaveBeenCalledTimes(2);

      // Another interval
      await vi.advanceTimersByTimeAsync(5000);
      expect(callback).toHaveBeenCalledTimes(3);

      poller.stopPollingForSessionToken();
    });

    it('waits for callback to complete before scheduling next poll', async () => {
      const poller = new SessionCookiePoller();

      let resolveCallback: () => void;
      const callbackPromise = new Promise<void>(resolve => {
        resolveCallback = resolve;
      });
      const callback = vi.fn().mockReturnValue(callbackPromise);

      poller.startPollingForSessionToken(callback);

      // Let the first call start
      await Promise.resolve();
      expect(callback).toHaveBeenCalledTimes(1);

      // Advance time while callback is still running - should NOT schedule next poll
      // because the callback promise hasn't resolved yet
      await vi.advanceTimersByTimeAsync(5000);

      // Should still only be 1 call since previous call hasn't completed
      expect(callback).toHaveBeenCalledTimes(1);

      // Complete the callback
      resolveCallback!();
      await Promise.resolve();

      // Now advance time for the next interval
      await vi.advanceTimersByTimeAsync(5000);

      expect(callback).toHaveBeenCalledTimes(2);

      poller.stopPollingForSessionToken();
    });
  });
});
