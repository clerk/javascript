import { useEffect, useRef, useState } from 'react';

export interface SpinDelayOptions {
  /** Wait this long before showing the spinner, so quick actions never flash one. */
  delay?: number;
  /** Once shown, keep the spinner up at least this long, so it never flickers off. */
  minDuration?: number;
}

const DEFAULT_DELAY = 500;
const DEFAULT_MIN_DURATION = 200;

/**
 * Gates a boolean loading flag so the spinner only appears for actions slow enough to warrant it, and
 * never flickers. Inspired by https://github.com/smeijer/spin-delay, reworked around a single visible
 * flag: a `delay`-timer arms the spinner and a symmetric `minDuration`-timer holds it, each cancelled
 * by effect cleanup when `loading` flips before it fires.
 */
export function useSpinDelay(loading: boolean, options: SpinDelayOptions = {}): boolean {
  const delay = options.delay ?? DEFAULT_DELAY;
  const minDuration = options.minDuration ?? DEFAULT_MIN_DURATION;

  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (loading && !visible) {
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }

    if (!loading && visible) {
      const remaining = minDuration - (Date.now() - shownAt.current);
      if (remaining <= 0) {
        setVisible(false);
        return;
      }
      const timer = setTimeout(() => setVisible(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [loading, visible, delay, minDuration]);

  return visible;
}
