import { useRef } from 'react';

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * A hook that retains the previous value of a primitive type.
 * It uses a ref to prevent causing unnecessary re-renders.
 *
 * @internal
 *
 * @example
 * ```
 * Render 1: value = 'A' → returns null
 * Render 2: value = 'B' → returns 'A'
 * Render 3: value = 'B' → returns 'A'
 * Render 4: value = 'B' → returns 'A'
 * Render 5: value = 'C' → returns 'B'
 * ```
 */
export function usePreviousValue<T extends Primitive>(value: T) {
  const currentRef = useRef(value);
  const previousRef = useRef<T | null>(null);

  if (currentRef.current !== value) {
    previousRef.current = currentRef.current;
    currentRef.current = value;
  }

  return previousRef.current;
}
