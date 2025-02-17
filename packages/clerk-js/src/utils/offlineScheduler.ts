import { isBrowserOnline } from '@clerk/shared/browser';

/**
 * While online callbacks passed to `.schedule` will execute immediately.
 * While offline callbacks passed to `.schedule` are de-duped and only the first one will be scheduled for execution when online.
 */
export const createOfflineScheduler = () => {
  let scheduled = false;

  const schedule = (cb: () => void) => {
    if (scheduled) {
      return;
    }
    if (isBrowserOnline()) {
      cb();
      return;
    }
    scheduled = true;
    const controller = new AbortController();
    window.addEventListener(
      'online',
      () => {
        void cb();
        scheduled = false;
        controller.abort();
      },
      {
        signal: controller.signal,
      },
    );
  };

  return {
    schedule,
  };
};
