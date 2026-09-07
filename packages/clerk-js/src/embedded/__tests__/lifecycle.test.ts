import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Clerk } from '../../core/clerk';
import { createEmbeddedLifecycle } from '../lifecycle';

function fixture(status = 'ready') {
  const getToken = vi.fn().mockResolvedValue('jwt');
  const reload = vi.fn().mockResolvedValue({ id: 'client' });
  const fetch = vi.fn().mockResolvedValue({ id: 'environment' });
  const commit = vi.fn().mockResolvedValue(undefined);
  const clerk = {
    status,
    session: { status: 'active', getToken },
    client: { reload },
    __internal_environment: { fetch },
    updateClient: vi.fn(),
    updateEnvironment: vi.fn(),
  };
  return {
    getToken,
    reload,
    fetch,
    commit,
    clerk,
    lifecycle: createEmbeddedLifecycle(clerk as unknown as Clerk, commit),
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('embedded application lifecycle', () => {
  it('backs off failed requests, recovers, and stops requests in the background and after disposal', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const f = fixture();
    f.getToken.mockRejectedValueOnce(new Error('offline'));
    f.lifecycle.start();
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.getToken).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(9999);
    expect(f.getToken).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(f.getToken).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.getToken).toHaveBeenCalledTimes(3);
    await f.lifecycle.setActive(false);
    await vi.advanceTimersByTimeAsync(120000);
    expect(f.getToken).toHaveBeenCalledTimes(3);
    await f.lifecycle.setActive(true);
    expect(f.getToken).toHaveBeenCalledTimes(4);
    f.lifecycle.dispose();
    await vi.advanceTimersByTimeAsync(120000);
    expect(f.getToken).toHaveBeenCalledTimes(4);
  });

  it('recovers all resources after offline startup and then polls only tokens', async () => {
    vi.useFakeTimers();
    const f = fixture('degraded');
    f.lifecycle.start();
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.reload).toHaveBeenCalledTimes(1);
    expect(f.fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.reload).toHaveBeenCalledTimes(1);
    expect(f.getToken).toHaveBeenCalledTimes(2);
    f.lifecycle.dispose();
  });

  it('coalesces simultaneous foreground refreshes and retries a failed environment', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const f = fixture();
    f.fetch.mockRejectedValueOnce(new Error('offline'));
    await Promise.allSettled([f.lifecycle.setActive(true), f.lifecycle.setActive(true)]);
    expect(f.reload).toHaveBeenCalledTimes(1);
    expect(f.fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(f.fetch).toHaveBeenCalledTimes(2);
    f.lifecycle.dispose();
  });
});
