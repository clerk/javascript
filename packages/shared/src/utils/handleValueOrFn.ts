type VOrFnReturnsV<T> = T | undefined | ((v: URL) => T);
export function handleValueOrFn<T>(value: VOrFnReturnsV<T>, url: URL): T | undefined;
export function handleValueOrFn<T>(value: VOrFnReturnsV<T>, url: URL, defaultValue: T): T;
/**
 *
 */
export function handleValueOrFn<T>(value: VOrFnReturnsV<T>, url: URL, defaultValue?: unknown): unknown {
  if (typeof value === 'function') {
    return (value as (v: URL) => T)(url);
  }

  if (typeof value !== 'undefined') {
    return value;
  }

  if (typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  return undefined;
}
