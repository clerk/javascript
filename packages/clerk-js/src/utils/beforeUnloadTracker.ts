import { CLERK_BEFORE_UNLOAD_EVENT } from './windowNavigate';

/**
 * Tracks beforeUnload events.
 *
 * Ideally we should not be always listening for the beforeUnload event
 * as it effectively disables the browser's BF cache.

 * To avoid this limitation, use the startTracking/ stopTracking methods
 * to listen for the event just before potential navigation is about to happen
 *
 * @internal
 */
const createBeforeUnloadListener = () => {
  let _isUnloading = false;

  const toggle = () => (_isUnloading = true);

  const startListening = () => {
    window.addEventListener('beforeunload', toggle);
    window.addEventListener(CLERK_BEFORE_UNLOAD_EVENT, toggle);
  };

  const stopListening = () => {
    window.removeEventListener('beforeunload', toggle);
    window.removeEventListener(CLERK_BEFORE_UNLOAD_EVENT, toggle);
  };

  const isUnloading = () => _isUnloading;

  return { startListening, stopListening, isUnloading };
};

export const createBeforeUnloadTracker = (enabled = false) => {
  if (!enabled) {
    return {
      track: async (fn: () => Promise<void>) => {
        await fn();
      },
      isUnloading: () => false,
    };
  }

  const l = createBeforeUnloadListener();
  return {
    track: async (fn: () => Promise<void>) => {
      l.startListening();
      await fn();
      l.stopListening();
    },
    isUnloading: l.isUnloading,
  };
};
