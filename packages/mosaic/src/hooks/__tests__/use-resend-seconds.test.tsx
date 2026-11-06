import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useResendSeconds } from '../use-resend-seconds';

describe('useResendSeconds', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const render = (resendAvailableAt: number | undefined, maxSeconds = 30) =>
    renderHook(({ resendAvailableAt, maxSeconds }) => useResendSeconds(resendAvailableAt, maxSeconds), {
      initialProps: { resendAvailableAt, maxSeconds },
    });

  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  it('is zero and schedules nothing without a lock', () => {
    const { result } = render(undefined);

    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('counts down each second, then stops its timer at zero', async () => {
    const { result } = render(Date.now() + 30_000);

    expect(result.current).toBe(30);
    await advance(1_000);
    expect(result.current).toBe(29);
    await advance(29_000);
    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows the full cooldown on the first render after locking, even when its clock is stale', () => {
    const { result, rerender } = render(undefined, 60);
    vi.setSystemTime(Date.now() + 5 * 60_000);

    rerender({ resendAvailableAt: Date.now() + 60_000, maxSeconds: 60 });

    expect(result.current).toBe(60);
  });

  it('reaches zero on the next second when the clock jumps past the unlock time', async () => {
    const { result } = render(Date.now() + 30_000);

    vi.setSystemTime(Date.now() + 60_000);
    await advance(1_000);

    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('restarts when a new lock replaces one that ran out', async () => {
    const { result, rerender } = render(Date.now() + 30_000);
    await advance(30_000);
    expect(result.current).toBe(0);

    rerender({ resendAvailableAt: Date.now() + 30_000, maxSeconds: 30 });
    expect(result.current).toBe(30);
    await advance(1_000);
    expect(result.current).toBe(29);
  });

  it('is zero and stops its timer when the lock is cleared', () => {
    const { result, rerender } = render(Date.now() + 30_000);

    rerender({ resendAvailableAt: undefined, maxSeconds: 30 });

    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops its timer on unmount', () => {
    const { unmount } = render(Date.now() + 30_000);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
