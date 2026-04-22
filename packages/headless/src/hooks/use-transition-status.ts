'use client';

import { useEffect, useState } from 'react';

export type TransitionStatus = 'starting' | 'ending' | undefined;

/**
 * Core state machine for enter/exit animations.
 *
 * Tracks whether a component should be in the DOM (`mounted`) and which
 * animation phase it is in (`transitionStatus`).
 *
 * - When `open` becomes true: synchronously sets `mounted=true` and
 *   `transitionStatus='starting'` during render so the first committed DOM
 *   frame carries `[data-starting-style]`. One animation frame later, clears
 *   the status so the CSS transition fires.
 * - When `open` becomes false: synchronously sets `transitionStatus='ending'`.
 *   The element stays mounted until the caller explicitly calls `setMounted(false)`
 *   (typically after all CSS animations have finished).
 */
export function useTransitionStatus(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [transitionStatus, setTransitionStatus] = useState<TransitionStatus>(open ? 'starting' : undefined);

  // Synchronous render-phase state updates. Running these during render (not in
  // useEffect) guarantees the first committed DOM includes the right data
  // attributes — critical for `[data-starting-style]` to be present on mount.
  if (open && !mounted) {
    setMounted(true);
    setTransitionStatus('starting');
  }
  if (!open && mounted && transitionStatus !== 'ending') {
    setTransitionStatus('ending');
  }
  if (!mounted && transitionStatus !== undefined) {
    setTransitionStatus(undefined);
  }

  // After the browser has painted the 'starting' frame, remove it so the CSS
  // transition fires toward the element's resting style.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      setTransitionStatus(undefined);
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  return { mounted, transitionStatus, setMounted };
}
