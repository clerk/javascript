import Lock from 'browser-tabs-lock';

export function SafeLock(key: string) {
  const lock = new Lock();

  window.addEventListener('beforeunload', async () => {
    await lock.releaseLock(key);
  });

  const acquireLockAndRun = async (cb: () => unknown) => {
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
