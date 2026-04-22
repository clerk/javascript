import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTransitionStatus } from './use-transition-status';

describe('useTransitionStatus', () => {
  let rafCallbacks: Array<FrameRequestCallback>;
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCallbacks = [];
    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn(cb => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    globalThis.cancelAnimationFrame = vi.fn(id => {
      rafCallbacks[id - 1] = () => {};
    });
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
  });

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach(cb => cb(performance.now()));
  }

  it('returns mounted=false and status=undefined when open=false', () => {
    const { result } = renderHook(() => useTransitionStatus(false));
    expect(result.current.mounted).toBe(false);
    expect(result.current.transitionStatus).toBeUndefined();
  });

  it("returns mounted=true and status='starting' when open=true", () => {
    const { result } = renderHook(() => useTransitionStatus(true));
    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionStatus).toBe('starting');
  });

  it('synchronously sets mounted and starting when open flips true', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionStatus(open), {
      initialProps: { open: false },
    });
    expect(result.current.mounted).toBe(false);

    rerender({ open: true });

    // Both must be set in the same render — no intermediate frame
    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionStatus).toBe('starting');
  });

  it('clears starting status after one rAF', () => {
    const { result } = renderHook(() => useTransitionStatus(true));
    expect(result.current.transitionStatus).toBe('starting');

    act(() => flushRaf());

    expect(result.current.transitionStatus).toBeUndefined();
  });

  it('sets ending status synchronously when open flips false', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionStatus(open), {
      initialProps: { open: true },
    });
    act(() => flushRaf()); // clear starting

    rerender({ open: false });

    expect(result.current.transitionStatus).toBe('ending');
    expect(result.current.mounted).toBe(true);
  });

  it('stays mounted until setMounted(false) is called', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionStatus(open), {
      initialProps: { open: true },
    });
    act(() => flushRaf());

    rerender({ open: false });
    expect(result.current.mounted).toBe(true);

    act(() => result.current.setMounted(false));
    expect(result.current.mounted).toBe(false);
  });

  it('clears transitionStatus when unmounted', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionStatus(open), {
      initialProps: { open: true },
    });
    act(() => flushRaf());

    rerender({ open: false });
    expect(result.current.transitionStatus).toBe('ending');

    act(() => result.current.setMounted(false));
    expect(result.current.transitionStatus).toBeUndefined();
  });

  it('handles rapid open→close before rAF fires', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionStatus(open), {
      initialProps: { open: false },
    });

    // Open
    rerender({ open: true });
    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionStatus).toBe('starting');

    // Close before rAF clears starting
    rerender({ open: false });
    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionStatus).toBe('ending');

    // The rAF from opening should be cancelled, not interfere
    act(() => flushRaf());
    expect(result.current.transitionStatus).toBe('ending');
  });
});
