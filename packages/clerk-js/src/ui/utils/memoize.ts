const memoCache = new Map<string, any>();

/**
 * Memoize function results to avoid repeated expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T, keyFn?: (...args: Parameters<T>) => string): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (memoCache.has(key)) {
      return memoCache.get(key);
    }

    const result = fn(...args);
    memoCache.set(key, result);
    return result;
  }) as T;
}

/**
 * Get cache statistics
 * @internal - Test utility only
 */
export function getCacheStats(): { size: number } {
  return {
    size: memoCache.size,
  };
}

/**
 * Clear memoization cache
 * @internal - Test utility only
 */
export function clearMemoCache(): void {
  memoCache.clear();
}
