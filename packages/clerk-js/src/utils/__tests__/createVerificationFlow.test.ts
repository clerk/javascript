import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createVerificationFlow } from '../createVerificationFlow';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup(prepare = vi.fn().mockResolvedValue(undefined)) {
  const reload = vi.fn().mockResolvedValue({ status: 'pending' });
  const flow = createVerificationFlow<{ redirectUrl: string }, { status: string }>({
    prepare,
    reload,
    isComplete: resource => resource.status === 'verified',
  });
  return { ...flow, prepare, reload };
}

describe('verification flow lifecycle', () => {
  it('does not start polling after cancellation during preparation', async () => {
    const preparation = createDeferredPromise();
    const flow = setup(vi.fn().mockReturnValue(preparation.promise));
    const settled = vi.fn();
    void flow.start({ redirectUrl: '/verify' }).then(settled, settled);
    flow.cancel();
    preparation.resolve();
    await vi.advanceTimersByTimeAsync(5000);

    expect(flow.reload).not.toHaveBeenCalled();
    expect(settled).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('allows restart while an older preparation remains pending', async () => {
    const oldPreparation = createDeferredPromise();
    const prepare = vi.fn().mockReturnValueOnce(oldPreparation.promise).mockResolvedValue(undefined);
    const flow = setup(prepare);
    const oldSettled = vi.fn();
    void flow.start({ redirectUrl: '/old' }).then(oldSettled, oldSettled);
    flow.cancel();
    flow.reload.mockResolvedValue({ status: 'verified' });
    const result = await flow.start({ redirectUrl: '/new' });
    oldPreparation.resolve();
    await vi.advanceTimersByTimeAsync(5000);

    expect(result).toEqual({ status: 'verified' });
    expect(flow.reload).toHaveBeenCalledTimes(1);
    expect(oldSettled).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops scheduled polling on cancellation', async () => {
    const flow = setup();
    void flow.start({ redirectUrl: '/verify' });
    await vi.advanceTimersByTimeAsync(0);
    expect(flow.reload).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);

    flow.cancel();
    await vi.advanceTimersByTimeAsync(5000);
    expect(flow.reload).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['resolve', 'reject'] as const)('ignores a late reload %s after cancellation', async outcome => {
    const request = createDeferredPromise();
    const flow = setup();
    flow.reload.mockReturnValue(request.promise);
    const settled = vi.fn();
    void flow.start({ redirectUrl: '/verify' }).then(settled, settled);
    await vi.advanceTimersByTimeAsync(0);
    flow.cancel();
    if (outcome === 'resolve') {
      request.resolve({ status: 'verified' });
    } else {
      request.reject(new Error('Obsolete request'));
    }
    await vi.advanceTimersByTimeAsync(5000);

    expect(settled).not.toHaveBeenCalled();
    expect(flow.reload).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('returns the verified resource and stops polling', async () => {
    const flow = setup();
    const resource = { status: 'verified' };
    flow.reload.mockResolvedValueOnce({ status: 'pending' }).mockResolvedValue(resource);
    const result = flow.start({ redirectUrl: '/verify' });
    await vi.advanceTimersByTimeAsync(1000);

    await expect(result).resolves.toBe(resource);
    expect(flow.reload).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('propagates preparation and active polling failures', async () => {
    const failure = new Error('Verification failed');
    const flow = setup(vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined));
    await expect(flow.start({ redirectUrl: '/verify' })).rejects.toBe(failure);
    expect(flow.reload).not.toHaveBeenCalled();
    flow.reload.mockRejectedValue(failure);
    await expect(flow.start({ redirectUrl: '/verify' })).rejects.toBe(failure);
    expect(vi.getTimerCount()).toBe(0);
  });
});
