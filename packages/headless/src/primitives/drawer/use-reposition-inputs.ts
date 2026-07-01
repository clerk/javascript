'use client';

import { useEffect } from 'react';

import { isInput } from './helpers';

export interface UseRepositionInputsOptions {
  /** `repositionInputs && open` — the hook is inert unless this is true. */
  enabled: boolean;
  popupRef: React.RefObject<HTMLElement | null>;
}

/**
 * Keeps a focused text field visible above the virtual keyboard. When the
 * keyboard opens, `visualViewport` shrinks; we lift the popup by that amount and
 * cap its height to the visible area. Inert where `visualViewport` is
 * unavailable (e.g. desktop, happy-dom) and restores inline styles on cleanup.
 *
 * iOS hardening (the pre-focus `translateY` trick and a `focus` override) and
 * snap-point-aware offsets are deferred — see the README follow-ups.
 */
export function useRepositionInputs({ enabled, popupRef }: UseRepositionInputsOptions): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const viewport = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!viewport) {
      return;
    }

    // Track the element we actually mutated so cleanup restores exactly that one
    // (rather than reading the ref at cleanup time, when it may have changed).
    let touched: HTMLElement | null = null;

    const onResize = (): void => {
      const popup = popupRef.current;
      if (!popup) {
        return;
      }
      const active = document.activeElement;
      if (!active || !isInput(active)) {
        // The keyboard has closed (focus usually falls back to `body`); drop the
        // lift we applied so the sheet doesn't stay raised until unmount.
        if (touched) {
          touched.style.height = '';
          touched.style.bottom = '';
          touched = null;
        }
        return;
      }
      const keyboardHeight = window.innerHeight - viewport.height;
      const popupHeight = popup.getBoundingClientRect().height;
      popup.style.height = popupHeight > viewport.height ? `${viewport.height}px` : '';
      popup.style.bottom = `${Math.max(keyboardHeight, 0)}px`;
      touched = popup;
    };

    viewport.addEventListener('resize', onResize);
    return () => {
      viewport.removeEventListener('resize', onResize);
      if (touched) {
        touched.style.height = '';
        touched.style.bottom = '';
      }
    };
  }, [enabled, popupRef]);
}
