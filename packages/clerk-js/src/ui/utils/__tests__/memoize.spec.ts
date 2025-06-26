import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearMemoCache, getCacheStats, memoize } from '../memoize';

describe('memoize', () => {
  beforeEach(() => {
    clearMemoCache();
  });

  afterEach(() => {
    clearMemoCache();
  });

  describe('basic memoization', () => {
    it('should memoize function results', () => {
      const mockFn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn);

      // First call
      const result1 = memoizedFn(5);
      expect(result1).toBe(10);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Second call with same args - should use cache
      const result2 = memoizedFn(5);
      expect(result2).toBe(10);
      expect(mockFn).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should call function again with different arguments', () => {
      const mockFn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn);

      memoizedFn(5);
      memoizedFn(10);

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(5);
      expect(mockFn).toHaveBeenCalledWith(10);
    });

    it('should handle multiple arguments correctly', () => {
      const mockFn = vi.fn((a: number, b: number, c: string) => `${a + b}${c}`);
      const memoizedFn = memoize(mockFn);

      const result1 = memoizedFn(1, 2, 'test');
      expect(result1).toBe('3test');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Same args - should use cache
      const result2 = memoizedFn(1, 2, 'test');
      expect(result2).toBe('3test');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Different args - should call function
      const result3 = memoizedFn(1, 2, 'different');
      expect(result3).toBe('3different');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('custom key function', () => {
    it('should use custom key function when provided', () => {
      const mockFn = vi.fn((color: string, alpha: number) => `rgba(${color}, ${alpha})`);
      const customKeyFn = vi.fn((color: string, alpha: number) => `${color}:${alpha}`);
      const memoizedFn = memoize(mockFn, customKeyFn);

      memoizedFn('red', 0.5);

      expect(customKeyFn).toHaveBeenCalledWith('red', 0.5);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Same call should use cache
      memoizedFn('red', 0.5);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(customKeyFn).toHaveBeenCalledTimes(2);
    });

    it('should use JSON.stringify as default key function', () => {
      const mockFn = vi.fn((obj: { a: number; b: string }) => obj.a + obj.b);
      const memoizedFn = memoize(mockFn);

      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'test' };

      memoizedFn(obj1);
      memoizedFn(obj2); // Same structure, should use cache

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('cache management', () => {
    it('should track cache size correctly', () => {
      const mockFn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn);

      expect(getCacheStats().size).toBe(0);

      memoizedFn(1);
      expect(getCacheStats().size).toBe(1);

      memoizedFn(2);
      expect(getCacheStats().size).toBe(2);

      // Same arg shouldn't increase cache size
      memoizedFn(1);
      expect(getCacheStats().size).toBe(2);
    });

    it('should clear cache when clearMemoCache is called', () => {
      const mockFn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn);

      memoizedFn(1);
      memoizedFn(2);
      expect(getCacheStats().size).toBe(2);

      clearMemoCache();
      expect(getCacheStats().size).toBe(0);

      // Should call function again after cache clear
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(3); // 2 before clear + 1 after
    });
  });

  describe('function signature preservation', () => {
    it('should preserve function signature and return type', () => {
      const originalFn = (a: number, b: string): string => `${a}${b}`;
      const memoizedFn = memoize(originalFn);

      // TypeScript should understand the types
      const result: string = memoizedFn(42, 'test');
      expect(result).toBe('42test');
    });

    it('should handle void return types', () => {
      const mockFn = vi.fn((_message: string): void => {
        // no-op for testing
      });
      const memoizedFn = memoize(mockFn);

      memoizedFn('test');
      memoizedFn('test'); // Should use cache

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined and null arguments', () => {
      const mockFn = vi.fn((a: any, b: any) => `${a}-${b}`);
      const memoizedFn = memoize(mockFn);

      memoizedFn(undefined, null);
      memoizedFn(undefined, null); // Should use cache

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle complex objects as arguments', () => {
      const mockFn = vi.fn((config: { theme: string; colors: string[] }) => config.theme);
      const memoizedFn = memoize(mockFn);

      const config1 = { theme: 'dark', colors: ['red', 'blue'] };
      const config2 = { theme: 'dark', colors: ['red', 'blue'] };

      memoizedFn(config1);
      memoizedFn(config2); // Same structure, should use cache

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle functions that throw errors', () => {
      const mockFn = vi.fn((shouldThrow: boolean) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return 'success';
      });
      const memoizedFn = memoize(mockFn);

      // Error should not be cached
      expect(() => memoizedFn(true)).toThrow('Test error');
      expect(() => memoizedFn(true)).toThrow('Test error');
      expect(mockFn).toHaveBeenCalledTimes(2);

      // Successful result should be cached
      expect(memoizedFn(false)).toBe('success');
      expect(memoizedFn(false)).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3); // 2 errors + 1 success
    });
  });
});
