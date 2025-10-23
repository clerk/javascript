import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SafeLock } from '../safeLock';

// Mock browser-tabs-lock
const mockAcquireLock = vi.fn();
const mockReleaseLock = vi.fn();

vi.mock('browser-tabs-lock', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      acquireLock: mockAcquireLock,
      releaseLock: mockReleaseLock,
    })),
  };
});

describe('SafeLock', () => {
  let originalNavigatorLocks: LockManager | undefined;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockAcquireLock.mockReset();
    mockReleaseLock.mockReset();

    // Save original navigator.locks
    originalNavigatorLocks = navigator.locks;

    // Remove navigator.locks to force browser-tabs-lock fallback
    // @ts-expect-error - Deleting readonly property for testing
    delete navigator.locks;
  });

  afterEach(() => {
    // Restore navigator.locks
    if (originalNavigatorLocks) {
      Object.defineProperty(navigator, 'locks', {
        value: originalNavigatorLocks,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('when localStorage is unavailable', () => {
    it('should handle localStorage access errors during acquireLock gracefully', async () => {
      // Mock acquireLock to throw localStorage error (simulating Safari Private Browsing)
      mockAcquireLock.mockRejectedValue(new Error('localStorage not available'));

      const safeLock = SafeLock('test-key');
      const callback = vi.fn().mockResolvedValue('callback-result');

      // Should not throw
      await expect(safeLock.acquireLockAndRun(callback)).resolves.toBeUndefined();

      // Callback should not be executed since lock acquisition failed
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle localStorage access errors during releaseLock gracefully', async () => {
      // Mock acquireLock to succeed
      mockAcquireLock.mockResolvedValue(true);
      // Mock releaseLock to throw localStorage error
      mockReleaseLock.mockRejectedValue(new Error('localStorage not available'));

      const safeLock = SafeLock('test-key');
      const callback = vi.fn().mockResolvedValue('callback-result');

      // Should not throw even though releaseLock fails
      await expect(safeLock.acquireLockAndRun(callback)).resolves.toBe('callback-result');

      // Callback should be executed since lock acquisition succeeded
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle DOMException QuotaExceededError during acquireLock', async () => {
      // Create a realistic DOMException as thrown in Safari Private Browsing
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      mockAcquireLock.mockRejectedValue(quotaError);

      const safeLock = SafeLock('test-key');
      const callback = vi.fn();

      // Should not throw
      await expect(safeLock.acquireLockAndRun(callback)).resolves.toBeUndefined();

      // Callback should not be executed
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle DOMException during releaseLock', async () => {
      mockAcquireLock.mockResolvedValue(true);
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      mockReleaseLock.mockRejectedValue(quotaError);

      const safeLock = SafeLock('test-key');
      const callback = vi.fn().mockResolvedValue('success');

      // Should complete successfully despite releaseLock error
      await expect(safeLock.acquireLockAndRun(callback)).resolves.toBe('success');

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('when localStorage is available', () => {
    it('should execute callback when lock acquisition succeeds', async () => {
      mockAcquireLock.mockResolvedValue(true);
      mockReleaseLock.mockResolvedValue(undefined);

      const safeLock = SafeLock('test-key');
      const callback = vi.fn().mockResolvedValue('test-result');

      const result = await safeLock.acquireLockAndRun(callback);

      expect(result).toBe('test-result');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(mockAcquireLock).toHaveBeenCalledWith('test-key', 5000);
      expect(mockReleaseLock).toHaveBeenCalledWith('test-key');
    });

    it('should not execute callback when lock acquisition fails', async () => {
      mockAcquireLock.mockResolvedValue(false);

      const safeLock = SafeLock('test-key');
      const callback = vi.fn();

      await safeLock.acquireLockAndRun(callback);

      expect(callback).not.toHaveBeenCalled();
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it('should release lock even if callback throws', async () => {
      mockAcquireLock.mockResolvedValue(true);
      mockReleaseLock.mockResolvedValue(undefined);

      const safeLock = SafeLock('test-key');
      const error = new Error('Callback error');
      const callback = vi.fn().mockRejectedValue(error);

      // Note: Current implementation catches all errors in the outer try-catch
      // This means callback errors are silently swallowed, which may not be ideal
      // but maintains backwards compatibility with browser-tabs-lock behavior
      const result = await safeLock.acquireLockAndRun(callback);

      expect(result).toBeUndefined();
      // Lock should still be released (finally block)
      expect(mockReleaseLock).toHaveBeenCalledWith('test-key');
    });

    it('should return callback result', async () => {
      mockAcquireLock.mockResolvedValue(true);
      mockReleaseLock.mockResolvedValue(undefined);

      const safeLock = SafeLock('test-key');
      const expectedResult = { data: 'test', success: true };
      const callback = vi.fn().mockResolvedValue(expectedResult);

      const result = await safeLock.acquireLockAndRun(callback);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('with native navigator.locks API', () => {
    beforeEach(() => {
      // Restore navigator.locks to enable native locks API
      if (originalNavigatorLocks) {
        Object.defineProperty(navigator, 'locks', {
          value: originalNavigatorLocks,
          writable: true,
          configurable: true,
        });
      }
    });

    it('should use navigator.locks when available', async () => {
      const mockRequest = vi.fn().mockImplementation(async (_key, _options, callback) => {
        return await callback();
      });

      Object.defineProperty(navigator, 'locks', {
        value: { request: mockRequest },
        writable: true,
        configurable: true,
      });

      const safeLock = SafeLock('test-key');
      const callback = vi.fn().mockResolvedValue('native-lock-result');

      const result = await safeLock.acquireLockAndRun(callback);

      expect(result).toBe('native-lock-result');
      expect(mockRequest).toHaveBeenCalled();
      // browser-tabs-lock should not be used
      expect(mockAcquireLock).not.toHaveBeenCalled();
    });

    it('should handle navigator.locks errors gracefully', async () => {
      const mockRequest = vi.fn().mockRejectedValue(new Error('Lock timeout'));

      Object.defineProperty(navigator, 'locks', {
        value: { request: mockRequest },
        writable: true,
        configurable: true,
      });

      const safeLock = SafeLock('test-key');
      const callback = vi.fn();

      // Should return false on error, not throw
      const result = await safeLock.acquireLockAndRun(callback);

      expect(result).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle callback that returns undefined', async () => {
      mockAcquireLock.mockResolvedValue(true);
      mockReleaseLock.mockResolvedValue(undefined);

      const safeLock = SafeLock('test-key');
      const callback = vi.fn().mockResolvedValue(undefined);

      const result = await safeLock.acquireLockAndRun(callback);

      expect(result).toBeUndefined();
      expect(callback).toHaveBeenCalled();
    });

    it('should handle callback that returns null', async () => {
      mockAcquireLock.mockResolvedValue(true);
      mockReleaseLock.mockResolvedValue(undefined);

      const safeLock = SafeLock('test-key');
      const callback = vi.fn().mockResolvedValue(null);

      const result = await safeLock.acquireLockAndRun(callback);

      expect(result).toBeNull();
      expect(callback).toHaveBeenCalled();
    });

    it('should create separate lock instances for different keys', async () => {
      mockAcquireLock.mockResolvedValue(true);
      mockReleaseLock.mockResolvedValue(undefined);

      const lock1 = SafeLock('key1');
      const lock2 = SafeLock('key2');

      const callback1 = vi.fn().mockResolvedValue('result1');
      const callback2 = vi.fn().mockResolvedValue('result2');

      await lock1.acquireLockAndRun(callback1);
      await lock2.acquireLockAndRun(callback2);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});
