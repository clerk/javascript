import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../__tests__/async';
import { useDebouncedAsync } from '../use-debounced-async';

const DELAY = 300;

interface Props {
  value: string;
  enabled?: boolean;
}

function setup(run: (value: string, options: { signal: AbortSignal }) => Promise<string>, initial: Props) {
  return renderHook(({ value, enabled }: Props) => useDebouncedAsync(value, run, { delayMs: DELAY, enabled }), {
    initialProps: initial,
  });
}

describe('useDebouncedAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs only the latest value once it stops changing', async () => {
    const run = vi.fn((value: string) => Promise.resolve(`checked ${value}`));
    const { result, rerender } = setup(run, { value: 'a' });
    await act(() => vi.advanceTimersByTimeAsync(DELAY - 1));
    rerender({ value: 'ab' });
    await act(() => vi.advanceTimersByTimeAsync(DELAY - 1));
    expect(run).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(run).toHaveBeenCalledExactlyOnceWith('ab', { signal: expect.any(AbortSignal) });
    expect(result.current).toEqual({ data: 'checked ab', error: undefined, isPending: false });
  });

  it('keeps the last result while the next value is checked', async () => {
    const run = vi.fn((value: string) => Promise.resolve(`checked ${value}`));
    const { result, rerender } = setup(run, { value: 'a' });
    await act(() => vi.advanceTimersByTimeAsync(DELAY));
    rerender({ value: 'b' });
    expect(result.current).toEqual({ data: 'checked a', error: undefined, isPending: true });
  });

  it('aborts and ignores a check that is overtaken by a new value', async () => {
    const first = deferred<string>();
    const signals: AbortSignal[] = [];
    const run = vi.fn((value: string, { signal }: { signal: AbortSignal }) => {
      signals.push(signal);
      return value === 'a' ? first.promise : Promise.resolve('checked b');
    });
    const { result, rerender } = setup(run, { value: 'a' });
    await act(() => vi.advanceTimersByTimeAsync(DELAY));
    rerender({ value: 'b' });
    expect(signals[0]?.aborted).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(DELAY));
    await act(async () => {
      first.resolve('checked a');
      await first.promise;
    });
    expect(result.current.data).toBe('checked b');
  });

  it.each([
    ['rejects', () => Promise.reject(new Error('down'))],
    [
      'throws',
      () => {
        throw new Error('down');
      },
    ],
  ])('reports an error when the check %s', async (_, run) => {
    const { result } = setup(run, { value: 'a' });
    await act(() => vi.advanceTimersByTimeAsync(DELAY));
    expect(result.current).toEqual({ data: undefined, error: new Error('down'), isPending: false });
  });

  it('clears the result and cancels pending work when disabled', async () => {
    const run = vi.fn((value: string) => Promise.resolve(`checked ${value}`));
    const { result, rerender } = setup(run, { value: 'a' });
    await act(() => vi.advanceTimersByTimeAsync(DELAY));
    rerender({ value: 'b', enabled: false });
    expect(result.current).toEqual({ data: undefined, error: undefined, isPending: false });
    await act(() => vi.advanceTimersByTimeAsync(DELAY));
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not restart when the check function changes identity', async () => {
    const calls: string[] = [];
    const { rerender } = renderHook(
      ({ value }: Props) =>
        useDebouncedAsync(
          value,
          v => {
            calls.push(v);
            return Promise.resolve(v);
          },
          { delayMs: DELAY },
        ),
      { initialProps: { value: 'a' } },
    );
    await act(() => vi.advanceTimersByTimeAsync(DELAY - 1));
    rerender({ value: 'a' });
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(calls).toEqual(['a']);
  });

  it('aborts a running check on unmount', async () => {
    const signals: AbortSignal[] = [];
    const run = (_: string, { signal }: { signal: AbortSignal }) => {
      signals.push(signal);
      return new Promise<string>(() => {});
    };
    const { unmount } = setup(run, { value: 'a' });
    await act(() => vi.advanceTimersByTimeAsync(DELAY));
    unmount();
    expect(signals[0]?.aborted).toBe(true);
  });
});
