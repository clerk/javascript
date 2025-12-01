import { retry } from './retry';

/**
 * Safely imports a module with automatic retries on failure.
 * Useful for dynamic imports that might fail due to network issues or temporary loading problems.
 * Retries up to 3 times with exponential backoff.
 *
 * @param importFn - A function that returns a dynamic import promise
 * @returns A promise that resolves to the imported module
 *
 * @example
 * ```typescript
 * const module = await safeImport(() => import('./my-module'));
 * ```
 */
export const safeImport = async <T = any>(importFn: () => Promise<T>): Promise<T> => {
  return retry(importFn, {
    initialDelay: 100,
    shouldRetry: (_, iterations) => iterations <= 3,
    retryImmediately: true,
    factor: 2,
  });
};
