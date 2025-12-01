import Lock from 'browser-tabs-lock';

import { debugLogger } from '@/utils/debug';

const LOCK_TIMEOUT_MS = 4999;

/**
 * Module-level tracking of active locks for cleanup on page unload.
 * This ensures we only register one beforeunload listener regardless of how many locks are created.
 */
const activeLocks = new Map<string, Lock>();
let cleanupListenerRegistered = false;

function registerCleanupListener() {
  if (cleanupListenerRegistered) {
    return;
  }
  cleanupListenerRegistered = true;

  // Release all held locks when the tab is closing to prevent deadlocks.
  // Note: beforeunload handlers should be synchronous; async operations may not complete.
  // We fire-and-forget the release - best effort cleanup.
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

  // Track this lock for cleanup on page unload
  activeLocks.set(key, lock);
  registerCleanupListener();

  /**
   * Acquires the cross-tab lock and executes the callback while holding it.
   * If lock acquisition fails or times out, executes the callback anyway (degraded mode)
   * to ensure the operation completes rather than failing.
   */
  const acquireLockAndRun = async <T>(cb: () => Promise<T>): Promise<T> => {
    if ('locks' in navigator && isSecureContext) {
      const controller = new AbortController();
      const lockTimeout = setTimeout(() => controller.abort(), LOCK_TIMEOUT_MS);

      try {
        return await navigator.locks.request(key, { signal: controller.signal }, async () => {
          clearTimeout(lockTimeout);
          return await cb();
        });
      } catch {
        // Lock request was aborted (timeout) or failed
        // Execute callback anyway in degraded mode to ensure operation completes
        debugLogger.warn('Lock acquisition timed out, proceeding without lock (degraded mode)', { key }, 'safeLock');
        return await cb();
      }
    }

    // Fallback for non-secure contexts using localStorage-based locking
    if (await lock.acquireLock(key, LOCK_TIMEOUT_MS + 1)) {
      try {
        return await cb();
      } finally {
        await lock.releaseLock(key);
      }
    }

    // Lock acquisition timed out - execute callback anyway in degraded mode
    debugLogger.warn('Lock acquisition timed out, proceeding without lock (degraded mode)', { key }, 'safeLock');
    return await cb();
  };

  return { acquireLockAndRun };
}
