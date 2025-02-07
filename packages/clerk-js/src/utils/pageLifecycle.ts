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
    return { onPageFocus: noop };
  }

  const callbackQueue: Record<string, Array<() => void | Promise<void>>> = {
    focus: [],
  };

  window.addEventListener('focus', () => {
    if (document.visibilityState === 'visible') {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      callbackQueue['focus'].forEach(cb => cb());
    }
  });

  const onPageFocus = (cb: () => void | Promise<void>) => {
    callbackQueue['focus'].push(cb);
  };

  return { onPageFocus };
};
