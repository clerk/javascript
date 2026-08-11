'use client';

import { useLayoutEffect } from 'react';

/** The custom property the styled layer reads as the popup's `transform-origin`. */
const ORIGIN_PROPERTY = '--cl-dialog-origin';

/**
 * Points the popup's `transform-origin` at the element that opened it, so a dialog scales out
 * of its trigger rather than out of its own middle.
 *
 * A dialog runs `useFloating` with no positioning middleware — it is centred by CSS — so the
 * `cssVars` middleware that gives popovers `--cl-anchor-origin` has nothing to hook into. The
 * rect is measured here instead, once per open.
 *
 * With no trigger (a dialog driven entirely by `open`, from a route or a state machine) the
 * property is left unset and the styled layer's `var(--cl-dialog-origin, center)` fallback
 * centres the scale — which is the right answer, since there is no origin the user is looking at.
 */
export function useDialogOrigin(
  popupRef: React.RefObject<HTMLElement | null>,
  trigger: Element | null,
  open: boolean,
): void {
  useLayoutEffect(() => {
    const popup = popupRef.current;
    if (!open || !popup || !trigger) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    // `getBoundingClientRect` reports the SCALED box, and the entering frame is already at
    // `scale(0.98)`. Its CENTRE is not affected, though — the property is still unset at this
    // point, so that scale is about `center` — and `offsetWidth`/`offsetHeight` are the
    // unscaled layout dimensions. Together they recover the untransformed box, which is what
    // `transform-origin`'s coordinates are relative to. Measuring the scaled edges instead
    // would offset the origin by half the scale delta on each axis.
    const centerX = popupRect.left + popupRect.width / 2;
    const centerY = popupRect.top + popupRect.height / 2;
    const layoutLeft = centerX - popup.offsetWidth / 2;
    const layoutTop = centerY - popup.offsetHeight / 2;

    const originX = triggerRect.left + triggerRect.width / 2 - layoutLeft;
    const originY = triggerRect.top + triggerRect.height / 2 - layoutTop;

    popup.style.setProperty(ORIGIN_PROPERTY, `${originX}px ${originY}px`);

    // Runs in a layout effect, so this lands before paint on the frame that still carries
    // `data-starting-style` — the frame pinned at `opacity: 0` with `transition: none`. Moving
    // the origin repositions the scaled box, and that reflow is invisible for the same reason
    // the popover's is: nothing is painted yet, and the transition arms a frame later.
  }, [popupRef, trigger, open]);
}
