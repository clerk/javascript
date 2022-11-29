export type WorkerTimerId = number;

export type WorkerTimerEvent = {
  type: 'setTimeout' | 'clearTimeout' | 'setInterval' | 'clearInterval';
  id: WorkerTimerId;
  ms?: number;
};

export type WorkerTimerResponseEvent = Pick<WorkerTimerEvent, 'id'>;

export type WorkerTimeoutCallback = () => void;
export type WorkerSetTimeout = (cb: WorkerTimeoutCallback, ms: number) => WorkerTimerId;
export type WorkerClearTimeout = (id: WorkerTimerId) => void;
