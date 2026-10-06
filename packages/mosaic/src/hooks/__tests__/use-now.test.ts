import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNow } from '../use-now';

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const render = (updateInterval?: number) =>
    renderHook(({ updateInterval }) => useNow({ updateInterval }), { initialProps: { updateInterval } });

  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  it('returns the time at mount', () => {
    const { result } = render(60_000);
    expect(result.current).toEqual(new Date('2026-01-01T00:00:00Z'));
  });

  it('keeps the same value across re-renders between ticks', () => {
    const { result, rerender } = render(60_000);
    const first = result.current;

    vi.setSystemTime(new Date('2026-01-01T00:00:30Z'));
    rerender({ updateInterval: 60_000 });

    expect(result.current).toBe(first);
  });

  it('advances on each interval', async () => {
    const { result } = render(60_000);

    await advance(60_000);
    expect(result.current).toEqual(new Date('2026-01-01T00:01:00Z'));

    await advance(60_000);
    expect(result.current).toEqual(new Date('2026-01-01T00:02:00Z'));
  });

  it('does not tick without an update interval', async () => {
    const { result } = render();

    await advance(60_000);
    expect(result.current).toEqual(new Date('2026-01-01T00:00:00Z'));
  });

  it('starts ticking when the interval is set after mount', async () => {
    const { result, rerender } = render();

    await advance(5_000);
    rerender({ updateInterval: 1_000 });
    await advance(1_000);

    expect(result.current).toEqual(new Date('2026-01-01T00:00:06Z'));
  });

  it('stops its timer on unmount', () => {
    const { unmount } = render(1_000);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
