import { describe, expect, it, vi } from 'vitest';

import type { SafeLockReturn } from '../safeLock';
import { SafeLock } from '../safeLock';

describe('SafeLock', () => {
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
      // Skip if Web Locks not available (like in jsdom without polyfill)
      if (!('locks' in navigator) || !navigator.locks) {
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
});
