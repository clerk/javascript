import { act, renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFloatingTransition } from './use-floating-transition';

describe('useFloatingTransition', () => {
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
    const { result } = renderHook(() => useFloatingTransition({ open: false, ref }));

    expect(result.current.mounted).toBe(false);
    expect(result.current.transitionProps).toEqual({});
  });

  it('returns mounted=true with starting-style props on open', () => {
    const ref = createElementRef();
    const { result } = renderHook(() => useFloatingTransition({ open: true, ref }));

    expect(result.current.mounted).toBe(true);
    expect(result.current.transitionProps).toEqual({
      'data-cl-open': '',
      'data-cl-starting-style': '',
      style: { transition: 'none' },
    });
  });

  it('clears starting-style after first frame, keeps data-cl-open', () => {
    const ref = createElementRef();
    const { result } = renderHook(() => useFloatingTransition({ open: true, ref }));

    act(() => flushRaf());

    expect(result.current.transitionProps).toEqual({
      'data-cl-open': '',
    });
  });

  it('sets closing props while animations are running', async () => {
    const { ref, el, resolveAnim } = createAnimatingRef();
    const { result, rerender } = renderHook(({ open }) => useFloatingTransition({ open, ref }), {
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
      'data-cl-closed': '',
      'data-cl-ending-style': '',
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
    const { result, rerender } = renderHook(({ open }) => useFloatingTransition({ open, ref }), {
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

    const { result, rerender } = renderHook(({ open }) => useFloatingTransition({ open, ref }), {
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
    const { result, rerender } = renderHook(({ open }) => useFloatingTransition({ open, ref }), {
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
    const { result, rerender } = renderHook(({ open }) => useFloatingTransition({ open, ref }), {
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
    expect(result.current.transitionProps['data-cl-open']).toBe('');

    // After rAF, ending-style is cleared and we're in stable open state
    act(() => flushRaf());
    expect(result.current.transitionProps['data-cl-ending-style']).toBeUndefined();
    expect(result.current.transitionProps['data-cl-open']).toBe('');

    // Cleanup
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    await act(async () => {
      resolveAnim();
      await new Promise(r => setTimeout(r, 0));
    });
  });
});
