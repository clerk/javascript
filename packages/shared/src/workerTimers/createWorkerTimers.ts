import { noop } from '../utils/noop';
import pollerWorkerSource from './workerTimers.built';
import type {
  WorkerClearTimeout,
  WorkerSetTimeout,
  WorkerTimeoutCallback,
  WorkerTimerEvent,
  WorkerTimerId,
  WorkerTimerResponseEvent,
} from './workerTimers.types';

const createWebWorker = (source: string, opts: ConstructorParameters<typeof Worker>[1] = {}): Worker | null => {
  if (typeof Worker === 'undefined') {
    return null;
  }

  try {
    const blob = new Blob([source], { type: 'application/javascript; charset=utf-8' });
    const workerScript = globalThis.URL.createObjectURL(blob);
    return new Worker(workerScript, opts);
  } catch {
    console.warn('Clerk: Cannot create worker from blob. Consider adding worker-src blob:; to your CSP');
    return null;
  }
};

const fallbackTimers = () => {
  const setTimeout = globalThis.setTimeout.bind(globalThis) as WorkerSetTimeout;
  const setInterval = globalThis.setInterval.bind(globalThis) as WorkerSetTimeout;
  const clearTimeout = globalThis.clearTimeout.bind(globalThis) as WorkerClearTimeout;
  const clearInterval = globalThis.clearInterval.bind(globalThis) as WorkerClearTimeout;
  return { setTimeout, setInterval, clearTimeout, clearInterval, cleanup: noop };
};

export const createWorkerTimers = () => {
  let id = 0;
  const generateId = () => id++;
  const callbacks = new Map<WorkerTimerId, WorkerTimeoutCallback>();
  const post = (w: Worker | null, p: WorkerTimerEvent) => w?.postMessage(p);
  const handleMessage = (e: MessageEvent<WorkerTimerResponseEvent>) => {
    callbacks.get(e.data.id)?.();
  };

  let worker = createWebWorker(pollerWorkerSource, { name: 'clerk-timers' });
  worker?.addEventListener('message', handleMessage);

  if (!worker) {
    return fallbackTimers();
  }

  const init = () => {
    if (!worker) {
      worker = createWebWorker(pollerWorkerSource, { name: 'clerk-timers' });
      worker?.addEventListener('message', handleMessage);
    }
  };

  const cleanup = () => {
    if (worker) {
      worker.terminate();
      worker = null;
      callbacks.clear();
    }
  };

  const setTimeout: WorkerSetTimeout = (cb, ms) => {
    init();
    const id = generateId();
    callbacks.set(id, () => {
      cb();
      callbacks.delete(id);
    });
    post(worker, { type: 'setTimeout', id, ms });
    return id;
  };

  const setInterval: WorkerSetTimeout = (cb, ms) => {
    init();
    const id = generateId();
    callbacks.set(id, cb);
    post(worker, { type: 'setInterval', id, ms });
    return id;
  };

  const clearTimeout: WorkerClearTimeout = id => {
    init();
    callbacks.delete(id);
    post(worker, { type: 'clearTimeout', id });
  };

  const clearInterval: WorkerClearTimeout = id => {
    init();
    callbacks.delete(id);
    post(worker, { type: 'clearInterval', id });
  };

  return { setTimeout, setInterval, clearTimeout, clearInterval, cleanup };
};
