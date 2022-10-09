import { inClientSide } from '@clerk/shared';

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
  if (!inClientSide()) {
    return { isUnloading: noop, onPageVisible: noop };
  }

  const callbackQueue: Record<string, Array<() => void>> = {
    'visibilitychange:visible': [],
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      callbackQueue['visibilitychange:visible'].forEach(cb => cb());
    }
  });

  const onPageVisible = (cb: () => void) => {
    callbackQueue['visibilitychange:visible'].push(cb);
  };

  return { onPageVisible };
};
