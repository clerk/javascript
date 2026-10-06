import { useEffect, useRef, useState } from 'react';

export interface DebouncedAsyncOptions {
  /** Wait this long after the last change before running. */
  delayMs: number;
  /** When `false`, clears the result and cancels any waiting or running check. Defaults to `true`. */
  enabled?: boolean;
}

export interface DebouncedAsyncResult<TData> {
  data: TData | undefined;
  error: unknown;
  isError: boolean;
  isPending: boolean;
}

interface Settled<TValue, TData> {
  value: TValue;
  data: TData | undefined;
  error: unknown;
  isError: boolean;
}

/**
 * Runs `run(value)` once `value` has stopped changing for `delayMs`, and returns the latest result.
 * The previous result stays visible while the next one is pending. A new value, disabling or
 * unmounting aborts the `signal` and drops any result that arrives afterwards.
 *
 * @example
 * const strength = useDebouncedAsync(password, (value, { signal }) => checkStrength(value, { signal }), {
 *   delayMs: 300,
 *   enabled: password !== '',
 * });
 */
export function useDebouncedAsync<TValue, TData>(
  value: TValue,
  run: (value: TValue, options: { signal: AbortSignal }) => Promise<TData>,
  { delayMs, enabled = true }: DebouncedAsyncOptions,
): DebouncedAsyncResult<TData> {
  const runRef = useRef(run);
  const [settled, setSettled] = useState<Settled<TValue, TData>>();

  useEffect(() => {
    runRef.current = run;
  });

  useEffect(() => {
    if (!enabled) {
      setSettled(undefined);
      return;
    }
    const controller = new AbortController();
    const settle = (result: Omit<Settled<TValue, TData>, 'value'>) => {
      if (!controller.signal.aborted) {
        setSettled({ value, ...result });
      }
    };
    const timer = setTimeout(() => {
      void Promise.resolve()
        .then(() => runRef.current(value, { signal: controller.signal }))
        .then(
          data => settle({ data, error: undefined, isError: false }),
          (error: unknown) => settle({ data: undefined, error, isError: true }),
        );
    }, delayMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, enabled, delayMs]);

  if (!enabled) {
    return { data: undefined, error: undefined, isError: false, isPending: false };
  }
  return {
    data: settled?.data,
    error: settled?.error,
    isError: settled?.isError === true,
    isPending: settled === undefined || !Object.is(settled.value, value),
  };
}
