import React from 'react';

export interface Measurement {
  /** Content-box width, or `null` before the first measurement. */
  width: number | null;
  /** Content-box height, or `null` before the first measurement. */
  height: number | null;
}

const UNMEASURED: Measurement = { width: null, height: null };

/**
 * An element's size, kept current by a `ResizeObserver`. Attach the returned ref to the element to
 * measure; the measurement is `null` until it has been laid out once. Content box, the box a
 * container query measures, so a `width` compared against a breakpoint answers the way
 * `@container (max-width: …)` would.
 *
 * ```tsx
 * const [ref, { width }] = useMeasure<HTMLDivElement>();
 * const compact = width !== null && width <= 768;
 * ```
 */
export function useMeasure<T extends Element = Element>(): [(node: T | null) => void, Measurement] {
  const [node, setNode] = React.useState<T | null>(null);
  const [measurement, setMeasurement] = React.useState<Measurement>(UNMEASURED);

  React.useLayoutEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }
    // The observer reports once on `observe`, so there is no separate first read.
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        setMeasurement({ width: rect.width, height: rect.height });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, measurement];
}
