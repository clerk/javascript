import { useEffect, useRef, useState } from 'react';

export interface SpinDelayOptions {
  /** Wait this long before showing the value, so quick actions never flash a spinner. */
  delay?: number;
  /** Once shown, keep the value up at least this long, so the spinner never flickers off. */
  minDuration?: number;
}

const DEFAULT_DELAY = 500;
const DEFAULT_MIN_DURATION = 200;

/**
 * Spin-delays a nullable value: returns `null` until `value` has stayed non-null longer than `delay`
 * (so quick actions never flash a spinner), then holds the last non-null value for at least
 * `minDuration` after it clears (so the spinner never flickers off). A value-carrying rework of
 * https://github.com/smeijer/spin-delay: each timer lives in a `const` and is cancelled by effect
 * cleanup when `value` flips before it fires.
 */
export function useSpinDelay<T>(value: T | null, options: SpinDelayOptions = {}): T | null {
  const delay = options.delay ?? DEFAULT_DELAY;
  const minDuration = options.minDuration ?? DEFAULT_MIN_DURATION;

  const [shown, setShown] = useState<T | null>(null);
  const shownAt = useRef(0);

  useEffect(() => {
    // Nothing showing yet: arm a timer so the value only surfaces if it outlasts `delay`.
    if (shown === null) {
      if (value === null) {
        return;
      }
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setShown(value);
      }, delay);
      return () => clearTimeout(timer);
    }

    // Showing, and the value cleared: hold it for the rest of `minDuration`.
    if (value === null) {
      const remaining = minDuration - (Date.now() - shownAt.current);
      if (remaining <= 0) {
        setShown(null);
        return;
      }
      const timer = setTimeout(() => setShown(null), remaining);
      return () => clearTimeout(timer);
    }

    // Showing, and the value swapped to another non-null: surface it right away.
    if (value !== shown) {
      setShown(value);
    }
  }, [value, shown, delay, minDuration]);

  return shown;
}
