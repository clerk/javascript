import { useEffect, useRef } from 'react';

import { useSafeState } from './useSafeState';

type UseSpinDelayOptions = {
  /**
   * The amount of time (in ms) to wait before reflecting `value === true`. If `value` flips back
   * to `false` before this elapses, the flag is never set to `true` (the spinner is skipped).
   *
   * @default 0
   */
  delay?: number;
  /**
   * Once the flag becomes `true`, it stays `true` for at least this long (in ms) even if the
   * underlying `value` returns to `false` earlier. Prevents the spinner from flickering on fast
   * operations.
   */
  minDuration?: number;
};

const DEFAULT_DELAY = 0;
const DEFAULT_MIN_DURATION_MS = 425;

/**
 * Smooths a transient boolean flag (typically a loading/fetching state) so the consumer never
 * shows a spinner that flickers on and off within a single frame.
 *
 * @example
 *   const isFetching = useSomeQuery();
 *   const showSpinner = useSpinDelay(isFetching, { delay: 0, minDuration: 425 });
 *   return showSpinner ? <Spinner /> : <Icon />;
 */
export function useSpinDelay(
  value: boolean,
  { delay = DEFAULT_DELAY, minDuration = DEFAULT_MIN_DURATION_MS }: UseSpinDelayOptions = {},
): boolean {
  const [displayed, setDisplayed] = useSafeState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (value && !displayed) {
      const timeout = setTimeout(() => {
        shownAtRef.current = Date.now();
        setDisplayed(true);
      }, delay);
      return () => clearTimeout(timeout);
    }

    if (!value && displayed) {
      const elapsed = shownAtRef.current != null ? Date.now() - shownAtRef.current : minDuration;
      const remaining = Math.max(0, minDuration - elapsed);
      const timeout = setTimeout(() => {
        shownAtRef.current = null;
        setDisplayed(false);
      }, remaining);
      return () => clearTimeout(timeout);
    }
  }, [value, displayed, delay, minDuration, setDisplayed]);

  return displayed;
}
