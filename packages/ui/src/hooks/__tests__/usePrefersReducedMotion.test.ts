import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersReducedMotion } from '../usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each(['modern', 'legacy'])('tracks preference changes and removes its %s listener on unmount', mode => {
    const events = new EventTarget();
    const query = {
      matches: true,
      ...(mode === 'modern'
        ? {
            addEventListener: vi.fn(events.addEventListener.bind(events)),
            removeEventListener: vi.fn(events.removeEventListener.bind(events)),
          }
        : {
            addListener: vi.fn((listener: EventListener) => events.addEventListener('change', listener)),
            removeListener: vi.fn((listener: EventListener) => events.removeEventListener('change', listener)),
          }),
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(query as unknown as MediaQueryList);
    const { result, unmount } = renderHook(usePrefersReducedMotion);
    expect(result.current).toBe(false);

    act(() => {
      query.matches = false;
      events.dispatchEvent(new Event('change'));
    });
    expect(result.current).toBe(true);

    act(() => {
      query.matches = true;
      events.dispatchEvent(new Event('change'));
    });
    expect(result.current).toBe(false);

    unmount();
    const removeListener = mode === 'modern' ? query.removeEventListener : query.removeListener;
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
