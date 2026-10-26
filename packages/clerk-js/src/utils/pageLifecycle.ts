import { inBrowser } from '@clerk/shared/browser';
import { noop } from '@clerk/shared/utils';

/**
 * Abstracts native browser event listener registration.
 * Instead, this helper exposes hooks (eg. onPageVisible) that handle
 * specific use cases.
 *
 * This is an effort to decouple event handling from the Clerk singleton,
 * any future events should be handled here.
 *
 * @internal
 */
export const createPageLifecycle = () => {
  if (!inBrowser()) {
    return { onPageFocus: noop, dispose: noop };
  }

  const callbackQueue: Record<string, Array<() => void>> = {
    focus: [],
  };

  const onFocus = () => {
    if (document.visibilityState === 'visible') {
      callbackQueue['focus'].forEach(cb => cb());
    }
  };
  window.addEventListener('focus', onFocus);

  const onPageFocus = (cb: () => void) => {
    callbackQueue['focus'].push(cb);
  };

  const dispose = () => {
    window.removeEventListener('focus', onFocus);
    callbackQueue['focus'].length = 0;
  };

  return { onPageFocus, dispose };
};
