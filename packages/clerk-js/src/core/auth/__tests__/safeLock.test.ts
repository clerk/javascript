import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SafeLockReturn } from '../safeLock';

describe('SafeLock', () => {
  let SafeLock: (key: string) => SafeLockReturn;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../safeLock');
    SafeLock = module.SafeLock;
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  describe('interface contract', () => {
    it('returns SafeLockReturn interface with acquireLockAndRun method', () => {
      const lock = SafeLock('test-interface');

      expect(lock).toHaveProperty('acquireLockAndRun');
      expect(typeof lock.acquireLockAndRun).toBe('function');
    });

    it('SafeLockReturn type allows creating mock implementations', () => {
      // This test verifies the type interface works correctly for mocking
      const mockLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockResolvedValue('mock-result'),
      };

      expect(mockLock.acquireLockAndRun).toBeDefined();
    });
  });

  describe('Web Locks API path', () => {
    it('uses Web Locks API when available in secure context', async () => {
      // Skip if Web Locks not available or not in secure context (e.g. jsdom without polyfill)
      if (!('locks' in navigator) || !navigator.locks || !isSecureContext) {
        return;
      }

      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const lock = SafeLock('test-weblocks-' + Date.now());
      const callback = vi.fn().mockResolvedValue('web-locks-result');

      const result = await lock.acquireLockAndRun(callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBe('web-locks-result');
      // Verify cleanup happened
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('shared lock pattern', () => {
    it('allows multiple components to share a lock via SafeLockReturn interface', async () => {
      // This demonstrates how AuthCookieService shares a lock between poller and focus handler
      const executionLog: string[] = [];

      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockImplementation(async (cb: () => Promise<unknown>) => {
          executionLog.push('lock-acquired');
          const result = await cb();
          executionLog.push('lock-released');
          return result;
        }),
      };

      // Simulate poller using the lock
      await sharedLock.acquireLockAndRun(() => {
        executionLog.push('poller-callback');
        return Promise.resolve('poller-done');
      });

      // Simulate focus handler using the same lock
      await sharedLock.acquireLockAndRun(() => {
        executionLog.push('focus-callback');
        return Promise.resolve('focus-done');
      });

      expect(executionLog).toEqual([
        'lock-acquired',
        'poller-callback',
        'lock-released',
        'lock-acquired',
        'focus-callback',
        'lock-released',
      ]);
    });

    it('mock lock can simulate sequential execution', async () => {
      const results: string[] = [];

      // Create a mock that simulates sequential lock behavior
      const sharedLock: SafeLockReturn = {
        acquireLockAndRun: vi.fn().mockImplementation(async (cb: () => Promise<unknown>) => {
          const result = await cb();
          results.push(result as string);
          return result;
        }),
      };

      // Both "tabs" try to refresh
      const promise1 = sharedLock.acquireLockAndRun(() => Promise.resolve('tab1-result'));
      const promise2 = sharedLock.acquireLockAndRun(() => Promise.resolve('tab2-result'));

      await Promise.all([promise1, promise2]);

      expect(results).toContain('tab1-result');
      expect(results).toContain('tab2-result');
      expect(sharedLock.acquireLockAndRun).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('propagates callback errors without double-invocation', async () => {
      const originalLocks = navigator.locks;
      const callbackError = new Error('Callback failed');
      const callback = vi.fn().mockRejectedValue(callbackError);

      const mockRequest = vi.fn().mockImplementation(async (_name, _options, cb) => {
        return await cb();
      });

      Object.defineProperty(navigator, 'locks', {
        value: { request: mockRequest },
        configurable: true,
      });

      try {
        const lock = SafeLock('test-error-propagation');
        await expect(lock.acquireLockAndRun(callback)).rejects.toThrow('Callback failed');
        expect(callback).toHaveBeenCalledTimes(1);
      } finally {
        Object.defineProperty(navigator, 'locks', {
          value: originalLocks,
          configurable: true,
        });
      }
    });

    it('invokes callback in degraded mode on AbortError (timeout)', async () => {
      const originalLocks = navigator.locks;
      const callback = vi.fn().mockResolvedValue('success');

      const abortError = new Error('Lock request aborted');
      abortError.name = 'AbortError';

      const mockRequest = vi.fn().mockRejectedValue(abortError);

      Object.defineProperty(navigator, 'locks', {
        value: { request: mockRequest },
        configurable: true,
      });

      try {
        const lock = SafeLock('test-abort-fallback');
        const result = await lock.acquireLockAndRun(callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(result).toBe('success');
      } finally {
        Object.defineProperty(navigator, 'locks', {
          value: originalLocks,
          configurable: true,
        });
      }
    });
  });

  describe('beforeunload listener consolidation', () => {
    it('registers only one beforeunload listener regardless of lock count', () => {
      const beforeUnloadCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'beforeunload');
      expect(beforeUnloadCalls).toHaveLength(0);

      SafeLock('lock-1');
      SafeLock('lock-2');
      SafeLock('lock-3');

      const afterCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'beforeunload');
      expect(afterCalls).toHaveLength(1);
    });

    it('fresh module import starts with clean state', async () => {
      // First module instance
      SafeLock('lock-a');
      expect(addEventListenerSpy.mock.calls.filter(call => call[0] === 'beforeunload')).toHaveLength(1);

      // Reset and get fresh module
      vi.resetModules();
      addEventListenerSpy.mockRestore();
      addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      const freshModule = await import('../safeLock');

      // Fresh module should register its own listener
      freshModule.SafeLock('lock-b');
      expect(addEventListenerSpy.mock.calls.filter(call => call[0] === 'beforeunload')).toHaveLength(1);
    });
  });
});
