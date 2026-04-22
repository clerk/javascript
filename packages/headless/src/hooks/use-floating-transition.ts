'use client';

import { type CSSProperties, type RefObject, useEffect, useMemo } from 'react';
import { useAnimationsFinished } from './use-animations-finished';
import { type TransitionStatus, useTransitionStatus } from './use-transition-status';

export interface UseFloatingTransitionOptions {
  open: boolean;
  ref: RefObject<HTMLElement | null>;
}

export interface TransitionProps {
  'data-cl-open'?: '';
  'data-cl-closed'?: '';
  'data-cl-starting-style'?: '';
  'data-cl-ending-style'?: '';
  style?: CSSProperties;
}

export interface UseFloatingTransitionReturn {
  mounted: boolean;
  transitionStatus: TransitionStatus;
  transitionProps: TransitionProps;
}

/**
 * Base UI-style enter/exit animation lifecycle for Floating UI components.
 *
 * Returns:
 * - `mounted`: whether the floating element should render. Gate your JSX on this.
 * - `transitionProps`: spread onto the floating element. Exposes
 *   `data-cl-open` / `data-cl-closed` / `data-cl-starting-style` /
 *   `data-cl-ending-style` data attributes and an inline `transition: none` on
 *   the first mount frame.
 *
 * Consumers drive all animation via CSS — no durations in JS. Works with CSS
 * transitions (via `[data-cl-starting-style]` / `[data-cl-ending-style]`) and
 * CSS keyframe animations (via `[data-cl-open]` / `[data-cl-closed]`).
 */
export function useFloatingTransition({ open, ref }: UseFloatingTransitionOptions): UseFloatingTransitionReturn {
  const { mounted, transitionStatus, setMounted } = useTransitionStatus(open);
  const runOnAnimationsFinished = useAnimationsFinished(ref, open);

  useEffect(() => {
    if (transitionStatus !== 'ending') return;
    runOnAnimationsFinished(() => {
      setMounted(false);
    });
  }, [transitionStatus, runOnAnimationsFinished, setMounted]);

  const transitionProps = useMemo<TransitionProps>(() => {
    const props: TransitionProps = {};
    if (open) {
      props['data-cl-open'] = '';
    } else if (mounted) {
      props['data-cl-closed'] = '';
    }
    if (transitionStatus === 'starting') {
      props['data-cl-starting-style'] = '';
      props.style = { transition: 'none' };
    } else if (transitionStatus === 'ending') {
      props['data-cl-ending-style'] = '';
    }
    return props;
  }, [open, mounted, transitionStatus]);

  return { mounted, transitionStatus, transitionProps };
}
