import Lock from 'browser-tabs-lock';

/**
 * Return type for SafeLock providing cross-tab lock coordination.
 */
export interface SafeLockReturn {
  /**
   * Acquires a cross-tab lock and executes the callback while holding it.
   * Other tabs attempting to acquire the same lock will wait until this callback completes.
   *
   * @param cb - Async callback to execute while holding the lock
   * @returns The callback's return value, or `false` if lock acquisition times out
   */
  acquireLockAndRun: (cb: () => Promise<unknown>) => Promise<unknown>;
}

/**
 * Creates a cross-tab lock mechanism for coordinating exclusive operations across browser tabs.
 *
 * This is used to prevent multiple tabs from performing the same operation simultaneously,
 * such as refreshing session tokens. When one tab holds the lock, other tabs will wait
 * until the lock is released before proceeding.
 *
 * @param key - Shared identifier for the lock
 * @returns SafeLockReturn with acquireLockAndRun method
 *
 * @example
 * ```typescript
 * const tokenLock = SafeLock('clerk.lock.refreshToken');
 *
 * // In Tab 1:
 * await tokenLock.acquireLockAndRun(async () => {
 *   await refreshToken(); // Only one tab executes this at a time
 * });
 *
 * // Tab 2 will wait for Tab 1 to finish before executing its callback
 * ```
 */
export function SafeLock(key: string): SafeLockReturn {
  const lock = new Lock();

  // Release any held locks when the tab is closing to prevent deadlocks
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  window.addEventListener('beforeunload', async () => {
    await lock.releaseLock(key);
  });

  const acquireLockAndRun = async (cb: () => Promise<unknown>) => {
    if ('locks' in navigator && isSecureContext) {
      const controller = new AbortController();
      const lockTimeout = setTimeout(() => controller.abort(), 4999);

      return await navigator.locks
        .request(key, { signal: controller.signal }, async () => {
          clearTimeout(lockTimeout);
          return await cb();
        })
        .catch(() => {
          // Lock request was aborted (timeout) or failed
          // Return false to indicate lock was not acquired (matches browser-tabs-lock behavior)
          return false;
        });
    }

    if (await lock.acquireLock(key, 5000)) {
      try {
        return await cb();
      } finally {
        await lock.releaseLock(key);
      }
    }

    return false;
  };

  return { acquireLockAndRun };
}
