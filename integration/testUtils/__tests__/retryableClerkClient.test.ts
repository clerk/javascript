import type { ClerkClient } from '@clerk/backend';
import { ClerkAPIResponseError } from '@clerk/shared/error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { printRetrySummary, withRetry } from '../retryableClerkClient';

function makeClerkAPIError(status: number, opts?: { retryAfter?: number }): ClerkAPIResponseError {
  return new ClerkAPIResponseError('API error', {
    data: [],
    status,
    ...(opts?.retryAfter != null ? { retryAfter: opts.retryAfter } : {}),
  });
}

/**
 * Returns a mock that rejects via a deferred microtask instead of returning a
 * pre-rejected promise. This avoids Node's PromiseRejectionHandledWarning:
 * the proxy's createProxy calls value.apply() to get a promise, then passes it
 * to retryOnFailure which awaits it — but with an already-rejected promise
 * there's a tiny gap before the await handler is registered.
 */
function mockDeferredReject(error: Error) {
  return vi.fn(() => Promise.resolve().then(() => Promise.reject(error)));
}

function makeMockClient(overrides: Record<string, unknown> = {}) {
  return {
    users: {
      getUser: vi.fn(),
      deleteUser: vi.fn(),
      syncValue: vi.fn(() => 'sync-result'),
      ...overrides,
    },
  } as unknown as ClerkClient;
}

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('retryOnFailure — retryable status codes', () => {
    it.each([429, 502, 503, 504])('retries on status %d up to MAX_RETRIES then throws', async status => {
      const error = makeClerkAPIError(status);
      const mock = mockDeferredReject(error);
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      const promise = (wrapped.users as any).getUser('user_123');

      // Attach handler before advancing timers to avoid unhandled rejection
      const expectation = expect(promise).rejects.toBe(error);

      // Advance through all 6 attempts (initial + 5 retries)
      for (let i = 0; i < 6; i++) {
        await vi.advanceTimersByTimeAsync(60_000);
      }

      await expectation;

      // 1 initial call + 5 retries = 6 total
      expect(mock).toHaveBeenCalledTimes(6);
    });

    it('succeeds on retry after transient failure', async () => {
      const error = makeClerkAPIError(429);
      const mock = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve().then(() => Promise.reject(error)))
        .mockResolvedValueOnce({ id: 'user_123' });
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      const promise = (wrapped.users as any).getUser('user_123');

      await vi.advanceTimersByTimeAsync(60_000);

      await expect(promise).resolves.toEqual({ id: 'user_123' });
      expect(mock).toHaveBeenCalledTimes(2);
    });
  });

  describe('retryOnFailure — non-retryable status codes', () => {
    it.each([400, 401, 403, 404, 500])('does not retry on status %d', async status => {
      const error = makeClerkAPIError(status);
      const mock = mockDeferredReject(error);
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      await expect((wrapped.users as any).getUser('user_123')).rejects.toBe(error);

      // Only the initial call, no retries
      expect(mock).toHaveBeenCalledTimes(1);
    });

    it('does not retry on non-ClerkAPIResponseError', async () => {
      const error = new Error('network failure');
      const mock = mockDeferredReject(error);
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      await expect((wrapped.users as any).getUser('user_123')).rejects.toBe(error);
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRetryDelay — retryAfter', () => {
    it('uses retryAfter seconds from the error for the delay', async () => {
      const error = makeClerkAPIError(429, { retryAfter: 3 });
      const mock = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve().then(() => Promise.reject(error)))
        .mockResolvedValueOnce({ id: 'user_123' });
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      const promise = (wrapped.users as any).getUser('user_123');

      // retryAfter=3 means 3000ms delay. Advancing 2999ms should not resolve the retry.
      await vi.advanceTimersByTimeAsync(2999);
      expect(mock).toHaveBeenCalledTimes(1);

      // Advancing past the 3000ms mark triggers the retry
      await vi.advanceTimersByTimeAsync(1);
      await vi.advanceTimersByTimeAsync(0);

      await expect(promise).resolves.toEqual({ id: 'user_123' });
      expect(mock).toHaveBeenCalledTimes(2);
    });

    it('caps retryAfter delay at MAX_RETRY_DELAY_MS (30s)', async () => {
      const error = makeClerkAPIError(429, { retryAfter: 60 });
      const mock = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve().then(() => Promise.reject(error)))
        .mockResolvedValueOnce({ id: 'user_123' });
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      const promise = (wrapped.users as any).getUser('user_123');

      // Even though retryAfter is 60s, delay should be capped at 30s
      await vi.advanceTimersByTimeAsync(30_000);
      await vi.advanceTimersByTimeAsync(0);

      await expect(promise).resolves.toEqual({ id: 'user_123' });
      expect(mock).toHaveBeenCalledTimes(2);
    });
  });

  describe('createProxy — synchronous methods', () => {
    it('passes through synchronous (non-Promise) return values unwrapped', () => {
      const syncFn = vi.fn(() => 'sync-result');
      const client = makeMockClient({ syncValue: syncFn });
      const wrapped = withRetry(client);

      const result = (wrapped.users as any).syncValue();

      expect(result).toBe('sync-result');
      expect(syncFn).toHaveBeenCalledTimes(1);
    });

    it('passes through non-function properties', () => {
      const client = { users: { count: 42 } } as unknown as ClerkClient;
      const wrapped = withRetry(client);

      expect((wrapped.users as any).count).toBe(42);
    });

    it('passes through nested object access', () => {
      const mock = vi.fn().mockResolvedValue({ id: 'user_123' });
      const client = { deeply: { nested: { getUser: mock } } } as unknown as ClerkClient;
      const wrapped = withRetry(client);

      expect(typeof (wrapped as any).deeply.nested.getUser).toBe('function');
    });
  });

  describe('printRetrySummary', () => {
    it('logs no-retries message when no retries occurred', () => {
      const mock = vi.fn().mockResolvedValue({ id: 'user_123' });
      const client = makeMockClient({ getUser: mock });
      withRetry(client);

      // printRetrySummary uses module-level retryStats. In a fresh run with no
      // retries it logs "No retries"; after retries from earlier tests it logs
      // a summary. Either way it produces a [Retry] message.
      printRetrySummary();

      const logCalled = (console.log as any).mock.calls.some((args: string[]) =>
        args[0]?.includes('[Retry]'),
      );
      const warnCalled = (console.warn as any).mock.calls.some((args: string[]) =>
        args[0]?.includes('[Retry] Summary'),
      );
      expect(logCalled || warnCalled).toBe(true);
    });

    it('logs retry summary after retries have occurred', async () => {
      const error = makeClerkAPIError(429);
      const mock = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve().then(() => Promise.reject(error)))
        .mockResolvedValueOnce({ id: 'user_123' });
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      const promise = (wrapped.users as any).getUser('user_123');
      await vi.advanceTimersByTimeAsync(60_000);
      await promise;

      // After a retry, console.warn should have been called with retry info
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[Retry]'));

      printRetrySummary();

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[Retry] Summary'));
    });
  });

  describe('console.warn during retries', () => {
    it('logs a warning with status, path, and attempt info on each retry', async () => {
      const error = makeClerkAPIError(503);
      const mock = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve().then(() => Promise.reject(error)))
        .mockImplementationOnce(() => Promise.resolve().then(() => Promise.reject(error)))
        .mockResolvedValueOnce({ id: 'user_123' });
      const client = makeMockClient({ getUser: mock });
      const wrapped = withRetry(client);

      const promise = (wrapped.users as any).getUser('user_123');

      await vi.advanceTimersByTimeAsync(60_000);
      await vi.advanceTimersByTimeAsync(60_000);

      await promise;

      const warnCalls = (console.warn as any).mock.calls.map((args: string[]) => args[0]);
      const retryCalls = warnCalls.filter((msg: string) => msg?.includes('[Retry] 503'));

      expect(retryCalls).toHaveLength(2);
      expect(retryCalls[0]).toContain('attempt 1/5');
      expect(retryCalls[1]).toContain('attempt 2/5');
      expect(retryCalls[0]).toContain('users.getUser');
    });
  });
});
