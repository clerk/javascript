import { act, renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTransition } from '../use-transition';

describe('useTransition', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCallbacks = new Map();
    nextRafId = 0;
    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn(cb => {
      const id = ++nextRafId;
      rafCallbacks.set(id, cb);
      return id;
    });
    globalThis.cancelAnimationFrame = vi.fn(id => {
      rafCallbacks.delete(id);
    });
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
  });

  function flushRaf() {
    const cbs = [...rafCallbacks.values()];
    rafCallbacks.clear();
    cbs.forEach(cb => cb(performance.now()));
  }

  function createElementRef(): RefObject<HTMLElement | null> {
    const el = document.createElement('div');
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    return { current: el };
  }

  function createAnimatingRef() {
    let resolveAnim!: () => void;
    const animPromise = new Promise<void>(r => {
      resolveAnim = r;
    });
    const el = document.createElement('div');
    el.getAnimations = vi.fn(() => [{ finished: animPromise }] as unknown as Animation[]);
    const ref = { current: el } as RefObject<HTMLElement | null>;
    return { ref, el, resolveAnim };
  }

  it('returns mounted=false and empty transitionProps when closed', () => {
    const ref = createElementRef();
    const { result } = renderHook(() => useTransition({ open: false, ref }));

    expect(result.current.mounted).toBe(false);
    expect(result.current.transitionProps).toEqual({});
  });

  it('mounts initially open content without starting style by default', () => {
    const ref = createElementRef();
    const { result } = renderHook(() => useTransition({ open: true, ref }));

    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionStatus).toBeUndefined();
    expect(result.current.transitionProps).toEqual({ 'data-open': '' });
  });

  it('clears opted-in starting style after first frame, keeps data-open', () => {
    const ref = createElementRef();
    const { result } = renderHook(() => useTransition({ open: true, ref, animateOnMount: true }));

    expect(result.current.transitionProps).toEqual({
      'data-open': '',
      'data-starting-style': '',
      style: { transition: 'none' },
    });

    act(() => flushRaf());

    expect(result.current.transitionProps).toEqual({
      'data-open': '',
    });
  });

  it('animates a later opening and a reopen with the default mount policy', async () => {
    const ref = createElementRef();
    const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref }), {
      initialProps: { open: false },
    });

    rerender({ open: true });
    expect(result.current.transitionProps['data-starting-style']).toBe('');
    act(() => flushRaf());

    await act(async () => {
      rerender({ open: false });
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.mounted).toBe(false);

    rerender({ open: true });
    expect(result.current.transitionProps['data-starting-style']).toBe('');
  });

  it('does not replay an entrance when the mount option changes', () => {
    const ref = createElementRef();
    const { result, rerender } = renderHook(
      ({ animateOnMount }) => useTransition({ open: true, ref, animateOnMount }),
      { initialProps: { animateOnMount: false } },
    );

    rerender({ animateOnMount: true });
    expect(result.current.transitionProps).toEqual({ 'data-open': '' });
  });

  it.each([undefined, false, true])(
    'animates reopen after an initially open instance closes (%s)',
    async animateOnMount => {
      const ref = createElementRef();
      const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref, animateOnMount }), {
        initialProps: { open: true },
      });

      expect(result.current.transitionStatus).toBe(animateOnMount ? 'starting' : undefined);
      act(() => flushRaf());
      await act(async () => {
        rerender({ open: false });
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(result.current.mounted).toBe(false);

      rerender({ open: true });
      expect(result.current.transitionProps['data-starting-style']).toBe('');
    },
  );

  it('sets closing props while animations are running', async () => {
    const { ref, el, resolveAnim } = createAnimatingRef();
    const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref }), {
      initialProps: { open: true },
    });
    act(() => flushRaf());

    rerender({ open: false });

    // Wait for effect to run
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionProps).toEqual({
      'data-closed': '',
      'data-ending-style': '',
    });

    // Cleanup: resolve to prevent hanging
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    await act(async () => {
      resolveAnim();
      await new Promise(r => setTimeout(r, 0));
    });
  });

  it('unmounts immediately when no animations are running', async () => {
    const ref = createElementRef();
    const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref }), {
      initialProps: { open: true },
    });
    act(() => flushRaf());

    await act(async () => {
      rerender({ open: false });
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.mounted).toBe(false);
  });

  it('stays mounted while animations are running', async () => {
    const { ref, el, resolveAnim } = createAnimatingRef();

    const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref }), {
      initialProps: { open: true },
    });
    act(() => flushRaf());

    rerender({ open: false });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.mounted).toBe(true);

    // Finish animation
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    await act(async () => {
      resolveAnim();
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.mounted).toBe(false);
  });

  it('handles rapid open→close — unmounts after animations finish', async () => {
    const ref = createElementRef();
    const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref }), {
      initialProps: { open: false },
    });

    // Open
    rerender({ open: true });
    expect(result.current.mounted).toBe(true);

    // Immediately close — no animations, so unmount happens on effect flush
    await act(async () => {
      rerender({ open: false });
      flushRaf();
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.mounted).toBe(false);
  });

  it('handles rapid close→open by cancelling exit', async () => {
    const { ref, el, resolveAnim } = createAnimatingRef();
    const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref }), {
      initialProps: { open: true },
    });
    act(() => flushRaf());

    // Close — sets ending
    rerender({ open: false });

    // Immediately reopen before animations finish — element never unmounted,
    // so the state machine goes straight back to open. The ending status
    // persists briefly until the next rAF clears it.
    rerender({ open: true });

    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionProps['data-open']).toBe('');

    // After rAF, ending-style is cleared and we're in stable open state
    act(() => flushRaf());
    expect(result.current.transitionProps['data-ending-style']).toBeUndefined();
    expect(result.current.transitionProps['data-open']).toBe('');

    // Cleanup
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    await act(async () => {
      resolveAnim();
      await new Promise(r => setTimeout(r, 0));
    });
  });

  it('does not unmount when the interrupted exit settles', async () => {
    const { ref, el, resolveAnim } = createAnimatingRef();
    const { result, rerender } = renderHook(({ open }) => useTransition({ open, ref }), {
      initialProps: { open: true },
    });
    act(() => flushRaf());

    // Close, then reopen before the exit animation finishes.
    rerender({ open: false });
    rerender({ open: true });
    act(() => flushRaf());

    // The exit's pending unmount must have been abandoned, so settling the
    // animation leaves the element mounted rather than restarting its entrance.
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    await act(async () => {
      resolveAnim();
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionProps).toEqual({ 'data-open': '' });
  });
});
