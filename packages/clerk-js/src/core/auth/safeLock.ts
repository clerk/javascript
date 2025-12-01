import Lock from 'browser-tabs-lock';

import { debugLogger } from '@/utils/debug';

const LOCK_TIMEOUT_MS = 4999;

const activeLocks = new Map<string, Lock>();
let cleanupListenerRegistered = false;

function registerCleanupListener() {
  if (cleanupListenerRegistered) {
    return;
  }
  cleanupListenerRegistered = true;

  window.addEventListener('beforeunload', () => {
    activeLocks.forEach((lock, key) => {
      void lock.releaseLock(key);
    });
  });
}

export interface SafeLockReturn {
  acquireLockAndRun: <T>(cb: () => Promise<T>) => Promise<T>;
}

/**
 * Creates a cross-tab lock for coordinating exclusive operations across browser tabs.
 *
 * Uses Web Locks API in secure contexts (HTTPS), falling back to browser-tabs-lock
 * (localStorage-based) in non-secure contexts.
 *
 * @param key - Unique identifier for the lock (same key = same lock across all tabs)
 */
export function SafeLock(key: string): SafeLockReturn {
  const lock = new Lock();

  activeLocks.set(key, lock);
  registerCleanupListener();

  const acquireLockAndRun = async <T>(cb: () => Promise<T>): Promise<T> => {
    if ('locks' in navigator && isSecureContext) {
      const controller = new AbortController();
      const lockTimeout = setTimeout(() => controller.abort(), LOCK_TIMEOUT_MS);

      try {
        return await navigator.locks.request(key, { signal: controller.signal }, async () => {
          clearTimeout(lockTimeout);
          return await cb();
        });
      } catch (error) {
        clearTimeout(lockTimeout);
        if (error instanceof Error && error.name === 'AbortError') {
          debugLogger.warn('Lock acquisition timed out, proceeding without lock (degraded mode)', { key }, 'safeLock');
          return await cb();
        }
        throw error;
      }
    }

    if (await lock.acquireLock(key, LOCK_TIMEOUT_MS + 1)) {
      try {
        return await cb();
      } finally {
        await lock.releaseLock(key);
      }
    }

    debugLogger.warn('Lock acquisition timed out, proceeding without lock (degraded mode)', { key }, 'safeLock');
    return await cb();
  };

  return { acquireLockAndRun };
}
