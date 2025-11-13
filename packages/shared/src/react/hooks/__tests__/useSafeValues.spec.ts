import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useWithSafeValues } from '../usePagesOrInfinite';

describe('useWithSafeValues', () => {
  it('returns defaults when params is true or undefined and caches page/pageSize', () => {
    const defaults = { initialPage: 1, pageSize: 10, infinite: false, keepPreviousData: false } as const;

    // params=true -> use defaults
    const { result: r1 } = renderHook(() => useWithSafeValues(true, defaults));
    expect(r1.current).toStrictEqual(defaults);

    // params=undefined -> defaults
    const { result: r2 } = renderHook(() => useWithSafeValues(undefined, defaults));
    expect(r2.current).toStrictEqual(defaults);

    // params with overrides; ensure initial refs are cached across re-renders
    const { result: r3, rerender } = renderHook(
      ({ page }) =>
        useWithSafeValues({ initialPage: page, pageSize: 5, infinite: true, keepPreviousData: true }, defaults as any),
      { initialProps: { page: 2 } },
    );

    expect(r3.current.initialPage).toBe(2);
    expect(r3.current.pageSize).toBe(5);

    // change prop; cached initialPage/pageSize should not change
    rerender({ page: 3 });
    expect(r3.current.initialPage).toBe(2);
    expect(r3.current.pageSize).toBe(5);
  });

  it('returns user-provided options over defaults (per JSDoc example)', () => {
    const defaults = { initialPage: 1, pageSize: 10, infinite: false, keepPreviousData: false } as const;
    const user = { initialPage: 2, pageSize: 20, infinite: true } as const;

    const { result } = renderHook(() => useWithSafeValues(user as any, defaults as any));

    expect(result.current).toStrictEqual({
      initialPage: 2,
      pageSize: 20,
      infinite: true,
      keepPreviousData: false,
    });
  });

  it('merges unspecified keys from defaults when options object omits them', () => {
    const defaults = { initialPage: 1, pageSize: 10, infinite: false, keepPreviousData: true } as const;
    const user = { pageSize: 50 } as const;

    const { result } = renderHook(() => useWithSafeValues(user as any, defaults as any));

    expect(result.current).toStrictEqual({
      initialPage: 1,
      pageSize: 50,
      infinite: false,
      keepPreviousData: true,
    });
  });
});
