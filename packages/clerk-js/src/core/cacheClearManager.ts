import { debugLogger } from '@/utils/debug';

const clearCallbacks = new Map<string, () => void>();

/**
 * Registers a callback to be executed when caches are cleared.
 * @param id - Unique identifier for the callback
 * @param callback - Function to execute when clearing caches
 * @returns Function to unregister the callback
 */
export const registerClearCallback = (id: string, callback: () => void): (() => void) => {
  clearCallbacks.set(id, callback);
  return () => clearCallbacks.delete(id);
};

/**
 * Clears all registered caches by executing all registered callbacks.
 * Continues execution even if individual callbacks throw errors.
 */
export const clearAllCaches = (): void => {
  clearCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      debugLogger.error('Error executing clear callback', { error }, 'CacheClearManager');
    }
  });
};
