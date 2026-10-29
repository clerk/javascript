import { createWorkerTimers } from './workerTimers';

export type PollerStop = () => void;
export type PollerCallback = (stop: PollerStop) => Promise<unknown>;
export type PollerRun = (cb: PollerCallback) => Promise<void>;

type PollerOptions = {
  delayInMs: number;
};

export type Poller = {
  run: PollerRun;
  stop: PollerStop;
};

/**
 *
 */
export function Poller({ delayInMs }: PollerOptions = { delayInMs: 1000 }): Poller {
  const workerTimers = createWorkerTimers();

  let timerId: number | undefined;
  let stopped = false;

  const stop: PollerStop = () => {
    if (timerId !== undefined) {
      workerTimers.clearTimeout(timerId);
      workerTimers.cleanup();
      timerId = undefined;
    }
    stopped = true;
  };

  const run: PollerRun = async cb => {
    stopped = false;
    await poll(cb);
  };

  const poll = async (cb: PollerCallback) => {
    await cb(stop);
    if (stopped) {
      return;
    }

    timerId = workerTimers.setTimeout(() => {
      void poll(cb);
    }, delayInMs) as any as number;
  };

  return { run, stop };
}
