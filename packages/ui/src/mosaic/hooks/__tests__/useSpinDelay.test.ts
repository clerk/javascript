import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSpinDelay } from '../useSpinDelay';

describe('useSpinDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const render = (value: string | null, options?: { delay?: number; minDuration?: number }) =>
    renderHook(({ value }) => useSpinDelay(value, options), { initialProps: { value } });

  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  it('returns null while idle', () => {
    const { result } = render(null);
    expect(result.current).toBeNull();
  });

  it('stays null during the delay window', async () => {
    const { result, rerender } = render(null, { delay: 500, minDuration: 200 });
    await act(() => rerender({ value: 'a' }));
    expect(result.current).toBeNull();

    await advance(499);
    expect(result.current).toBeNull();
  });

  it('surfaces the value once it outlasts the delay', async () => {
    const { result, rerender } = render(null, { delay: 500, minDuration: 200 });
    await act(() => rerender({ value: 'a' }));

    await advance(500);
    expect(result.current).toBe('a');
  });

  it('never surfaces a value that clears faster than the delay', async () => {
    const { result, rerender } = render(null, { delay: 500, minDuration: 200 });
    await act(() => rerender({ value: 'a' }));

    await advance(300);
    await act(() => rerender({ value: null }));

    await advance(1000);
    expect(result.current).toBeNull();
  });

  it('holds the value for at least minDuration once shown', async () => {
    const { result, rerender } = render(null, { delay: 500, minDuration: 200 });
    await act(() => rerender({ value: 'a' }));
    await advance(500);
    expect(result.current).toBe('a');

    // value clears almost immediately after it appeared
    await act(() => rerender({ value: null }));
    await advance(199);
    expect(result.current).toBe('a');

    await advance(1);
    expect(result.current).toBeNull();
  });

  it('keeps showing while the value persists beyond minDuration, then clears', async () => {
    const { result, rerender } = render(null, { delay: 500, minDuration: 200 });
    await act(() => rerender({ value: 'a' }));
    await advance(500);
    await advance(5000);
    expect(result.current).toBe('a');

    await act(() => rerender({ value: null }));
    expect(result.current).toBeNull();
  });

  it('swaps to a new value immediately when one replaces another mid-show', async () => {
    const { result, rerender } = render(null, { delay: 500, minDuration: 200 });
    await act(() => rerender({ value: 'a' }));
    await advance(500);
    expect(result.current).toBe('a');

    await act(() => rerender({ value: 'b' }));
    expect(result.current).toBe('b');
  });
});
