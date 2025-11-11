import { retry } from '../retry';

/**
 * Safely imports a module with automatic retries on failure.
 * Useful for dynamic imports that might fail due to network issues or temporary loading problems.
 * Retries up to 3 times with exponential backoff.
 *
 * @param modulePath - The path to the module to import
 * @returns A promise that resolves to the imported module
 *
 * @example
 * ```typescript
 * const module = await safeImport('./my-module');
 * ```
 */
export const safeImport = async <T = any>(modulePath: string): Promise<T> => {
  return retry(() => import(modulePath) as Promise<T>, {
    initialDelay: 100,
    shouldRetry: (_, iterations) => iterations <= 3,
    retryImmediately: true,
    factor: 2,
  });
};
