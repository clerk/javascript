import type { WorkerTimerEvent, WorkerTimerId, WorkerTimerResponseEvent } from './workerTimers.types';
// This file is loaded as TEXT by esbuild during build
// and fed into a blob so we can easily instantiate the web worker
// look at the tsup.config.ts file for more details on the loader

const respond = (p: WorkerTimerResponseEvent) => {
  self.postMessage(p);
};

const workerToTabIds: Record<WorkerTimerId, WorkerTimerId> = {};

self.addEventListener('message', e => {
  const data = e.data as WorkerTimerEvent;

  switch (data.type) {
    case 'setTimeout':
      workerToTabIds[data.id] = setTimeout(() => {
        respond({ id: data.id });
        delete workerToTabIds[data.id];
      }, data.ms) as unknown as WorkerTimerId;
      break;
    case 'clearTimeout':
      if (workerToTabIds[data.id]) {
        clearTimeout(workerToTabIds[data.id]);
        delete workerToTabIds[data.id];
      }
      break;
    case 'setInterval':
      workerToTabIds[data.id] = setInterval(() => {
        respond({ id: data.id });
      }, data.ms) as unknown as WorkerTimerId;
      break;
    case 'clearInterval':
      if (workerToTabIds[data.id]) {
        clearInterval(workerToTabIds[data.id]);
        delete workerToTabIds[data.id];
      }
      break;
  }
});
