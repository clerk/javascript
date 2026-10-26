import { act, render as renderTree, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../mosaic-provider';
import { MosaicNowProvider, useNow } from '../use-now';

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
  it('starts from the provider time instead of reading the clock', () => {
    const providerNow = new Date('2025-06-01T00:00:00Z');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MosaicNowProvider value={providerNow}>{children}</MosaicNowProvider>
    );

    const { result } = renderHook(() => useNow(), { wrapper });

    expect(result.current).toBe(providerNow);
  });

  it('ticks forward from the provider time', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MosaicNowProvider value={new Date('2025-06-01T00:00:00Z')}>{children}</MosaicNowProvider>
    );

    const { result } = renderHook(() => useNow({ updateInterval: 1_000 }), { wrapper });
    await advance(1_000);

    expect(result.current).toEqual(new Date('2026-01-01T00:00:01Z'));
  });

  it('gives components mounted later under MosaicProvider the time the provider mounted', () => {
    const seen: Date[] = [];
    const Consumer = () => {
      seen.push(useNow());
      return null;
    };

    const { rerender } = renderTree(
      <MosaicProvider>
        <Consumer />
      </MosaicProvider>,
    );
    vi.setSystemTime(new Date('2026-01-01T00:05:00Z'));
    rerender(
      <MosaicProvider>
        <Consumer />
        <Consumer />
      </MosaicProvider>,
    );

    expect(seen.at(-1)).toEqual(new Date('2026-01-01T00:00:00Z'));
    expect(new Set(seen).size).toBe(1);
  });
});
