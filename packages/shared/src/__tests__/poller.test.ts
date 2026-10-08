import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Poller } from '../poller';

const timers = vi.hoisted(() => ({
  setTimeout: vi.fn().mockReturnValue(0),
  clearTimeout: vi.fn(),
  cleanup: vi.fn(),
}));

vi.mock('../workerTimers', () => ({ createWorkerTimers: () => timers }));

beforeEach(() => vi.clearAllMocks());

describe('poller cleanup', () => {
  it('cleans up before a timer has been scheduled', () => {
    const poller = Poller();
    poller.stop();
    expect(timers.clearTimeout).not.toHaveBeenCalled();
    expect(timers.cleanup).toHaveBeenCalledOnce();
  });

  it('clears a timer with identifier zero', async () => {
    const poller = Poller();
    await poller.run(async () => {});
    poller.stop();
    expect(timers.clearTimeout).toHaveBeenCalledWith(0);
    expect(timers.cleanup).toHaveBeenCalledOnce();
  });

  it('can run again after cleanup', async () => {
    const poller = Poller();
    const callback = vi.fn().mockResolvedValue(undefined);
    await poller.run(callback);
    poller.stop();
    await poller.run(callback);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(timers.setTimeout).toHaveBeenCalledTimes(2);
    poller.stop();
  });
});
