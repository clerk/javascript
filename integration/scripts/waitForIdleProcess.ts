import type { ChildProcess } from 'node:child_process';

const createWaitForIdle = (opts?: { delayInMs: number }) => {
  const { delayInMs = 3000 } = opts || {};
  let id;
  let idler;

  const waitForIdle = new Promise(resolve => {
    idler = () => {
      clearTimeout(id);
      id = setTimeout(resolve, delayInMs);
    };
    idler();
  });

  return { idler, waitForIdle };
};

/**
 * Accepts a ChildProcess, usually started using `run` or `execa.spawn` and
 * returns a promise that resolves when the spawned process's stdout or stderr
 * has been idle for delayInMs milliseconds.
 */
export const waitForIdleProcess = (cp: ChildProcess, opts?: Parameters<typeof createWaitForIdle>[0]) => {
  const { idler, waitForIdle } = createWaitForIdle(opts);
  cp.stdout?.on('data', idler);
  cp.stderr?.on('data', idler);
  return waitForIdle;
};
