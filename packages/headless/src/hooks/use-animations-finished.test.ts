import { act, renderHook } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useAnimationsFinished } from './use-animations-finished';

function createMockElement(
  animations: Array<{ finished: Promise<void> }> = [],
  attributes: Record<string, string> = {},
): HTMLElement {
  const el = document.createElement('div');
  Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
  el.getAnimations = vi.fn(() => animations as unknown as Animation[]);
  return el;
}

describe('useAnimationsFinished', () => {
  it('fires callback immediately when ref.current is null', () => {
    const ref = createRef<HTMLElement>() as RefObject<HTMLElement | null>;
    const { result } = renderHook(() => useAnimationsFinished(ref, false));

    const callback = vi.fn();
    act(() => result.current(callback));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires callback immediately when getAnimations is not supported', () => {
    const ref = { current: document.createElement('div') } as RefObject<HTMLElement | null>;
    // Don't add getAnimations
    delete (ref.current as unknown as Record<string, unknown>).getAnimations;

    const { result } = renderHook(() => useAnimationsFinished(ref, false));

    const callback = vi.fn();
    act(() => result.current(callback));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires callback immediately when no animations are running', () => {
    const el = createMockElement([]);
    const ref = { current: el } as RefObject<HTMLElement | null>;

    const { result } = renderHook(() => useAnimationsFinished(ref, false));

    const callback = vi.fn();
    act(() => result.current(callback));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('waits for all animations to finish before firing callback', async () => {
    let resolveAnim!: () => void;
    const animPromise = new Promise<void>(r => {
      resolveAnim = r;
    });
    const el = createMockElement([{ finished: animPromise }]);
    const ref = { current: el } as RefObject<HTMLElement | null>;

    const { result } = renderHook(() => useAnimationsFinished(ref, false));

    const callback = vi.fn();
    act(() => result.current(callback));

    expect(callback).not.toHaveBeenCalled();

    // After animations finish, change getAnimations to return empty
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    await act(async () => resolveAnim());

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('aborts previous pending wait when called again', async () => {
    let resolveFirst!: () => void;
    const firstAnim = new Promise<void>(r => {
      resolveFirst = r;
    });
    const el = createMockElement([{ finished: firstAnim }]);
    const ref = { current: el } as RefObject<HTMLElement | null>;

    const { result } = renderHook(() => useAnimationsFinished(ref, false));

    const firstCallback = vi.fn();
    act(() => result.current(firstCallback));

    // Call again — should abort the first
    const secondCallback = vi.fn();
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    act(() => result.current(secondCallback));

    expect(secondCallback).toHaveBeenCalledTimes(1);

    // Resolve first animation — its callback should NOT fire
    await act(async () => resolveFirst());
    expect(firstCallback).not.toHaveBeenCalled();
  });

  it('re-checks animations when one is cancelled', async () => {
    let rejectAnim!: () => void;
    const cancelledAnim = new Promise<void>((_, reject) => {
      rejectAnim = reject;
    });
    const el = createMockElement([{ finished: cancelledAnim }]);
    const ref = { current: el } as RefObject<HTMLElement | null>;

    const { result } = renderHook(() => useAnimationsFinished(ref, false));

    const callback = vi.fn();
    act(() => result.current(callback));

    expect(callback).not.toHaveBeenCalled();

    // Cancel the animation — hook should re-check and find no new animations
    el.getAnimations = vi.fn(() => [] as unknown as Animation[]);
    await act(async () => {
      rejectAnim();
      // Let microtask queue flush
      await new Promise(r => setTimeout(r, 0));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('waits for starting-style attribute removal when open=true', async () => {
    const el = createMockElement([], { 'data-cl-starting-style': '' });
    const ref = { current: el } as RefObject<HTMLElement | null>;

    const { result } = renderHook(() => useAnimationsFinished(ref, true));

    const callback = vi.fn();
    act(() => result.current(callback));

    // Should not fire yet — waiting for attribute removal
    expect(callback).not.toHaveBeenCalled();

    // Remove the attribute — MutationObserver should fire
    await act(async () => {
      el.removeAttribute('data-cl-starting-style');
      // MutationObserver is async; wait a tick
      await new Promise(r => setTimeout(r, 0));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount', () => {
    let resolveAnim!: () => void;
    const animPromise = new Promise<void>(r => {
      resolveAnim = r;
    });
    const el = createMockElement([{ finished: animPromise }]);
    const ref = { current: el } as RefObject<HTMLElement | null>;

    const { result, unmount } = renderHook(() => useAnimationsFinished(ref, false));

    const callback = vi.fn();
    act(() => result.current(callback));

    // Unmount should abort
    unmount();

    // Resolve animation — callback should not fire because abort was called
    resolveAnim();

    expect(callback).not.toHaveBeenCalled();
  });
});
