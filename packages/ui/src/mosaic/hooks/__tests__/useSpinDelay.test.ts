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

  const render = (loading: boolean, options?: { delay?: number; minDuration?: number }) =>
    renderHook(({ loading }) => useSpinDelay(loading, options), { initialProps: { loading } });

  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  it('does not show while idle', () => {
    const { result } = render(false);
    expect(result.current).toBe(false);
  });

  it('does not show during the delay window', async () => {
    const { result, rerender } = render(false, { delay: 500, minDuration: 200 });
    await act(() => rerender({ loading: true }));
    expect(result.current).toBe(false);

    await advance(499);
    expect(result.current).toBe(false);
  });

  it('shows once loading outlasts the delay', async () => {
    const { result, rerender } = render(false, { delay: 500, minDuration: 200 });
    await act(() => rerender({ loading: true }));

    await advance(500);
    expect(result.current).toBe(true);
  });

  it('never shows for actions that finish faster than the delay', async () => {
    const { result, rerender } = render(false, { delay: 500, minDuration: 200 });
    await act(() => rerender({ loading: true }));

    await advance(300);
    await act(() => rerender({ loading: false }));

    await advance(1000);
    expect(result.current).toBe(false);
  });

  it('keeps showing for at least minDuration once shown', async () => {
    const { result, rerender } = render(false, { delay: 500, minDuration: 200 });
    await act(() => rerender({ loading: true }));
    await advance(500);
    expect(result.current).toBe(true);

    // loading resolves almost immediately after the spinner appeared
    await act(() => rerender({ loading: false }));
    await advance(199);
    expect(result.current).toBe(true);

    await advance(1);
    expect(result.current).toBe(false);
  });

  it('keeps showing while loading persists beyond minDuration, then clears', async () => {
    const { result, rerender } = render(false, { delay: 500, minDuration: 200 });
    await act(() => rerender({ loading: true }));
    await advance(500);
    await advance(5000);
    expect(result.current).toBe(true);

    await act(() => rerender({ loading: false }));
    expect(result.current).toBe(false);
  });
});
