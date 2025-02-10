import { isBrowserOnline } from '@clerk/shared/browser';

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
