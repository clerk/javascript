import Lock from 'browser-tabs-lock';

export interface SafeLockReturn {
  acquireLockAndRun: (cb: () => Promise<unknown>) => Promise<unknown>;
}

export function SafeLock(key: string): SafeLockReturn {
  const lock = new Lock();

  // TODO: Figure out how to fix this linting error
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  window.addEventListener('beforeunload', async () => {
    await lock.releaseLock(key);
  });

  const acquireLockAndRun = async (cb: () => Promise<unknown>) => {
    if ('locks' in navigator && isSecureContext) {
      const controller = new AbortController();
      const lockTimeout = setTimeout(() => controller.abort(), 4999);
      return await navigator.locks
        .request(key, { signal: controller.signal }, async () => {
          clearTimeout(lockTimeout);
          return await cb();
        })
        .catch(() => {
          // browser-tabs-lock never seems to throw, so we are mirroring the behavior here
          return false;
        });
    }

    if (await lock.acquireLock(key, 5000)) {
      try {
        return await cb();
      } finally {
        await lock.releaseLock(key);
      }
    }
  };

  return { acquireLockAndRun };
}
