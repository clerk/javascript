import { afterEach, describe, expect, it, vi } from 'vitest';

import { eventBus } from '../../core/events';
import { runAsyncResourceTask } from '../runAsyncResourceTask';

describe('runAsyncTask', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const resource = {} as any; //  runAsyncTask doesn't depend on resource being a BaseResource

  it('emits fetching/idle and returns result on success', async () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');
    const task = vi.fn().mockResolvedValue('ok');

    const { result, error } = await runAsyncResourceTask(resource, task);

    expect(task).toHaveBeenCalledTimes(1);
    expect(result).toBe('ok');
    expect(error).toBeNull();

    expect(emitSpy).toHaveBeenNthCalledWith(1, 'resource:error', {
      resource,
      error: null,
    });
    expect(emitSpy).toHaveBeenNthCalledWith(2, 'resource:fetch', {
      resource,
      status: 'fetching',
    });
    expect(emitSpy).toHaveBeenNthCalledWith(3, 'resource:fetch', {
      resource,
      status: 'idle',
    });
  });

  it('emits error and returns error on failure', async () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');
    const thrown = new Error('fail');
    const task = vi.fn().mockRejectedValue(thrown);

    const { result, error } = await runAsyncResourceTask(resource, task);

    expect(task).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
    expect(error).toBe(thrown);

    expect(emitSpy).toHaveBeenNthCalledWith(1, 'resource:error', {
      resource,
      error: null,
    });
    expect(emitSpy).toHaveBeenNthCalledWith(2, 'resource:fetch', {
      resource,
      status: 'fetching',
    });
    expect(emitSpy).toHaveBeenNthCalledWith(3, 'resource:error', {
      resource,
      error: thrown,
    });
    expect(emitSpy).toHaveBeenNthCalledWith(4, 'resource:fetch', {
      resource,
      status: 'idle',
    });
  });

  it('resets fetch status when a pending task is restored from bfcache', async () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');
    let resolveTask: () => void;
    const task = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveTask = resolve;
        }),
    );

    const pendingTask = runAsyncResourceTask(resource, task);
    await Promise.resolve();

    const pageShowEvent = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(pageShowEvent, 'persisted', { value: true });
    window.dispatchEvent(pageShowEvent);

    expect(emitSpy).toHaveBeenNthCalledWith(3, 'resource:fetch', {
      resource,
      status: 'idle',
    });

    resolveTask!();
    await pendingTask;
  });
});
