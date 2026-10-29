import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Poller } from '../poller';

vi.mock('../workerTimers', () => ({
  createWorkerTimers: () => {
    let nextId = 0;
    const timers = new Map<number, ReturnType<typeof setTimeout>>();
    return {
      setTimeout: (cb: () => void, ms: number) => {
        const id = nextId++;
        timers.set(id, setTimeout(cb, ms));
        return id;
      },
      clearTimeout: (id: number) => clearTimeout(timers.get(id)),
      cleanup: () => {},
    };
  },
}));

describe('Poller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stops polling when stopped while waiting for the next tick', async () => {
    const { run, stop } = Poller({ delayInMs: 100 });
    const cb = vi.fn();

    await run(cb);
    stop();
    await vi.advanceTimersByTimeAsync(500);

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('stops polling when stopped from a later tick', async () => {
    const { run, stop } = Poller({ delayInMs: 100 });
    const cb = vi.fn();

    await run(cb);
    await vi.advanceTimersByTimeAsync(100);
    stop();
    await vi.advanceTimersByTimeAsync(500);

    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('polls again when run after being stopped', async () => {
    const { run, stop } = Poller({ delayInMs: 100 });
    const cb = vi.fn();

    await run(cb);
    stop();
    await run(cb);
    await vi.advanceTimersByTimeAsync(100);
    stop();

    expect(cb).toHaveBeenCalledTimes(3);
  });
});
