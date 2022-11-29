import {
  WorkerClearTimeout,
  WorkerSetTimeout,
  WorkerTimeoutCallback,
  WorkerTimerEvent,
  WorkerTimerId,
  WorkerTimerResponseEvent,
} from './workerTimers.types';
// @ts-ignore
import pollerWorkerSource from './workerTimers.worker';

const createWebWorker = (source: string, opts: ConstructorParameters<typeof Worker>[1] = {}) => {
  const workerFile = new Blob([source]);
  const workerScript = globalThis.URL.createObjectURL(workerFile);
  return new Worker(workerScript, opts);
};

export const createWorkerTimers = () => {
  if (typeof Worker === 'undefined') {
    const setTimeout = globalThis.setTimeout as WorkerSetTimeout;
    const setInterval = globalThis.setInterval as WorkerSetTimeout;
    const clearTimeout = globalThis.clearTimeout as WorkerClearTimeout;
    const clearInterval = globalThis.clearInterval as WorkerClearTimeout;
    return { setTimeout, setInterval, clearTimeout, clearInterval };
  }

  let id = 0;
  const callbacks = new Map<WorkerTimerId, WorkerTimeoutCallback>();
  const generateId = () => id++;
  const worker = createWebWorker(pollerWorkerSource, { name: 'clerk-timers' });
  const post = (p: WorkerTimerEvent) => worker.postMessage(p);

  worker.addEventListener('message', e => {
    const data = e.data as WorkerTimerResponseEvent;
    callbacks.get(data.id)?.();
  });

  const setTimeout: WorkerSetTimeout = (cb, ms) => {
    const id = generateId();
    callbacks.set(id, cb);
    post({ type: 'setTimeout', id, ms });
    return id;
  };

  const setInterval: WorkerSetTimeout = (cb, ms) => {
    const id = generateId();
    callbacks.set(id, cb);
    post({ type: 'setInterval', id, ms });
    return id;
  };

  const clearTimeout: WorkerClearTimeout = id => {
    callbacks.delete(id);
    post({ type: 'clearTimeout', id });
  };

  const clearInterval: WorkerClearTimeout = id => {
    callbacks.delete(id);
    post({ type: 'clearInterval', id });
  };

  return { setTimeout, setInterval, clearTimeout, clearInterval };
};
