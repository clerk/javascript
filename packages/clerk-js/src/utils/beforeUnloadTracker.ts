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
export const createBeforeUnloadTracker = () => {
  let _isUnloading = false;

  const toggle = () => (_isUnloading = true);

  const startTracking = () => {
    window.addEventListener('beforeunload', toggle);
    window.addEventListener(CLERK_BEFORE_UNLOAD_EVENT, toggle);
  };

  const stopTracking = () => {
    window.removeEventListener('beforeunload', toggle);
    window.removeEventListener(CLERK_BEFORE_UNLOAD_EVENT, toggle);
  };

  const isUnloading = () => _isUnloading;

  return { startTracking, stopTracking, isUnloading };
};
