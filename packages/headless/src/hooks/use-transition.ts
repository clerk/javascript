'use client';

import { type CSSProperties, type RefObject, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useAnimationsFinished } from './use-animations-finished';
import { type TransitionStatus, useTransitionStatus } from './use-transition-status';

export interface UseTransitionOptions {
  open: boolean;
  ref: RefObject<HTMLElement | null>;
  /**
   * Fires once the enter or exit animation has finished — on exit, right after the element
   * unmounts. State that should reset when the element closes belongs here rather than in
   * `onOpenChange`, so the reset cannot show through the exit animation.
   */
  onOpenChangeComplete?: (open: boolean) => void;
}

export interface TransitionProps {
  'data-open'?: '';
  'data-closed'?: '';
  'data-starting-style'?: '';
  'data-ending-style'?: '';
  style?: CSSProperties;
}

export interface UseTransitionReturn {
  mounted: boolean;
  transitionStatus: TransitionStatus;
  transitionProps: TransitionProps;
}

/**
 * Enter/exit animation lifecycle hook.
 *
 * Returns:
 * - `mounted`: whether the element should render. Gate your JSX on this.
 * - `transitionProps`: spread onto the element. Exposes
 *   `data-open` / `data-closed` / `data-starting-style` /
 *   `data-ending-style` data attributes and an inline `transition: none` on
 *   the first mount frame.
 *
 * Consumers drive all animation via CSS — no durations in JS. Works with CSS
 * transitions (via `[data-starting-style]` / `[data-ending-style]`) and
 * CSS keyframe animations (via `[data-open]` / `[data-closed]`).
 */
export function useTransition({ open, ref, onOpenChangeComplete }: UseTransitionOptions): UseTransitionReturn {
  const { mounted, transitionStatus, setMounted } = useTransitionStatus(open);
  const runOnAnimationsFinished = useAnimationsFinished(ref, open);

  const onOpenChangeCompleteRef = useRef(onOpenChangeComplete);
  useLayoutEffect(() => {
    onOpenChangeCompleteRef.current = onOpenChangeComplete;
  });

  useEffect(() => {
    // `ending` outlives a reopen by one frame (the status clears on the next rAF), and the
    // element must not be scheduled to unmount in that window.
    if (!open && transitionStatus === 'ending') {
      // Cancelling on cleanup is what makes an exit interruptible: reopening
      // mid-exit must abandon the pending unmount, not unmount once the
      // retargeted transition settles.
      return runOnAnimationsFinished(() => {
        setMounted(false);
        onOpenChangeCompleteRef.current?.(false);
      });
    }
    if (open && transitionStatus === undefined) {
      return runOnAnimationsFinished(() => onOpenChangeCompleteRef.current?.(true));
    }
  }, [open, transitionStatus, runOnAnimationsFinished, setMounted]);

  const transitionProps = useMemo<TransitionProps>(() => {
    const props: TransitionProps = {};
    if (open) {
      props['data-open'] = '';
    } else if (mounted) {
      props['data-closed'] = '';
    }
    if (transitionStatus === 'starting') {
      props['data-starting-style'] = '';
      props.style = { transition: 'none' };
    } else if (transitionStatus === 'ending') {
      props['data-ending-style'] = '';
    }
    return props;
  }, [open, mounted, transitionStatus]);

  return { mounted, transitionStatus, transitionProps };
}
