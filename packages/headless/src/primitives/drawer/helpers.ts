/**
 * Pure helpers for the drag engine.
 *
 * NOTE: the live swipe amount is tracked in the engine's `curSwipe` ref (the
 * single source of truth), never parsed back from `getComputedStyle().transform`.
 * Because movement is driven through a CSS var, the composed matrix also carries
 * the snap offset and any nested `scale()`, so reading it back would be wrong.
 */

/** `<input type>` values that are not free-text and therefore never pop the virtual keyboard. */
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

/** Logarithmic rubber-banding for over-drag past the open position. (vaul `dampenValue`) */
export const dampen = (v: number): number => 8 * (Math.log(v + 1) - 2);

export const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

/**
 * Resolves the vertical swipe movement for a snap point, applying square-root
 * damping once the drag overshoots the fully-open edge (`nextOffset < 0`) so the
 * sheet resists travelling past it. `baseOffset` is the resting offset of the
 * active snap point (>= 0); `movementValue` is the signed live drag delta
 * (positive downward). Returns the movement to add on top of `baseOffset`.
 *
 * A distinct formula from {@link dampen}: snap drawers use square-root overshoot
 * damping (base-ui) while the plain rubber-band uses logarithmic damping (vaul).
 */
export function getSnapPointSwipeMovement(baseOffset: number, movementValue: number): number {
  const nextOffset = baseOffset + movementValue;
  if (nextOffset >= 0) {
    return movementValue;
  }
  return -Math.sqrt(-nextOffset) - baseOffset;
}

/** Whether focusing `el` would summon the on-screen keyboard (a text field or contenteditable). */
export function isInput(el: Element): boolean {
  return (
    (el instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(el.type)) ||
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
}

/**
 * Best-effort iOS detection. Used only to work around iOS not dispatching
 * `pointerup` after a scroll-cancelled gesture; never reached in happy-dom.
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return (
    /iP(hone|ad|od)/.test(navigator.platform) ||
    // iPadOS 13+ reports as a Mac, so additionally check for touch support.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Pointer capture that tolerates environments/states where it is unavailable.
 * happy-dom may not implement `set/releasePointerCapture`, and releasing a
 * pointer that was never captured throws `NotFoundError`; both are swallowed.
 */
export function safeCapture(el: Element, id: number, method: 'setPointerCapture' | 'releasePointerCapture'): void {
  try {
    el[method](id);
  } catch (e) {
    if (!(e instanceof DOMException && e.name === 'NotFoundError')) {
      throw e;
    }
  }
}
