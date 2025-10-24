import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePreviousValue } from '../usePreviousValue';

describe('usePreviousValue', () => {
  it('returns null on first render', () => {
    const { result } = renderHook(() => usePreviousValue('A'));
    expect(result.current).toBeNull();
  });

  it('tracks previous value for strings', () => {
    const { result, rerender } = renderHook((v: string) => usePreviousValue(v), { initialProps: 'A' });
    expect(result.current).toBeNull();
    rerender('B');
    expect(result.current).toBe('A');
    rerender('C');
    expect(result.current).toBe('B');
  });

  it('tracks previous value for numbers', () => {
    const { result, rerender } = renderHook((v: number) => usePreviousValue(v), { initialProps: 1 });
    expect(result.current).toBeNull();
    rerender(2);
    expect(result.current).toBe(1);
    rerender(2);
    expect(result.current).toBe(1);
    rerender(3);
    expect(result.current).toBe(2);
  });

  it('tracks previous value for booleans', () => {
    const { result, rerender } = renderHook((v: boolean) => usePreviousValue(v), { initialProps: false });
    expect(result.current).toBeNull();
    rerender(true);
    expect(result.current).toBe(false);
    rerender(false);
    expect(result.current).toBe(true);
  });

  it('tracks previous value for null and undefined', () => {
    const { result, rerender } = renderHook<string | null, string | null>(v => usePreviousValue(v), {
      initialProps: null,
    });
    expect(result.current).toBeNull();
    rerender(undefined);
    expect(result.current).toBeNull();
    rerender('x');
    expect(result.current).toBeUndefined();
    rerender(null);
    expect(result.current).toBe('x');
  });
});
