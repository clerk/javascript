import { inBrowser } from '@clerk/shared/browser';

const noop = () => {
  //
};

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
    return { onPageFocus: noop };
  }

  const callbackQueue: Record<string, Array<() => void>> = {
    focus: [],
  };

  window.addEventListener('focus', () => {
    if (document.visibilityState === 'visible') {
      callbackQueue['focus'].forEach(cb => cb());
    }
  });

  const onPageFocus = (cb: () => void) => {
    callbackQueue['focus'].push(cb);
  };

  return { onPageFocus };
};
