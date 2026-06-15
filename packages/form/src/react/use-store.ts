import type { ReadableAtom } from 'nanostores';
import { useCallback, useRef, useSyncExternalStore } from 'react';

/** Shallow equality for arrays and one-level objects; falls back to `Object.is`. */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const aArray = Array.isArray(a);
  if (aArray !== Array.isArray(b)) {
    return false;
  }
  if (aArray) {
    const aArr = a as unknown[];
    const bArr = b as unknown[];
    if (aArr.length !== bArr.length) {
      return false;
    }
    return aArr.every((v, i) => Object.is(v, bArr[i]));
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every(key => Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

/**
 * Subscribe to a nanostores store from React via `useSyncExternalStore`.
 *
 * A `selector` narrows the store to a slice; `isEqual` skips re-renders when the
 * slice is unchanged (defaults to shallow equality, which handles selectors that
 * return tuples/objects). This selector layer is what `@nanostores/react`'s
 * `useStore` lacks, and it is how `Field`/`Subscribe` keep re-renders minimal.
 */
export function useStore<T, S = T>(
  $store: ReadableAtom<T>,
  selector: (value: T) => S = value => value as unknown as S,
  isEqual: (a: S, b: S) => boolean = shallowEqual,
): S {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;
  const cache = useRef<{ value: S } | null>(null);

  // Must be referentially stable so useSyncExternalStore does not resubscribe
  // (and re-enter the store) on every commit.
  const subscribe = useCallback((onChange: () => void) => $store.listen(onChange), [$store]);

  const getSnapshot = useCallback(() => {
    const next = selectorRef.current($store.get());
    const last = cache.current;
    if (last && isEqualRef.current(last.value, next)) {
      return last.value;
    }
    cache.current = { value: next };
    return next;
  }, [$store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
