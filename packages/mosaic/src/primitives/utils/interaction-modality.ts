import type { FloatingContext } from '@floating-ui/react';
import { isVirtualClick } from '@floating-ui/react/utils';

/**
 * Whether an event that opened or closed a floating element came from the keyboard.
 *
 * `useClick` lets native buttons handle Enter/Space themselves, so keyboard activation on a
 * button arrives as a click with no pointer behind it, which is what `isVirtualClick` detects.
 * Other triggers open and close on `keydown` (Enter) or `keyup` (Space).
 */
export function isKeyboardEvent(event: Event): boolean {
  if (event.type.startsWith('key')) {
    return true;
  }

  // SAFETY: the remaining events come from `useClick`/`useHover`/`useDismiss`, which only ever
  // hand us pointer or mouse events here. `isVirtualClick` reads optional MouseEvent fields and
  // returns false for anything that lacks them.
  return isVirtualClick(event as MouseEvent);
}

/**
 * Whether the floating element was opened by the keyboard rather than by a pointer.
 *
 * floating-ui records the event that caused the open on `dataRef.current.openEvent`.
 */
export function isKeyboardOpen(context: Pick<FloatingContext, 'dataRef'>): boolean {
  const openEvent = context.dataRef.current.openEvent;

  return openEvent ? isKeyboardEvent(openEvent) : false;
}

/**
 * The kind of input behind an open or close, Base UI's taxonomy: the empty string means there
 * was no interaction — the change was programmatic (a state machine, a route, a mutation result).
 */
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';

/** Classifies the event behind an open/close into an {@link InteractionType}. */
export function interactionTypeFromEvent(event: Event | undefined): InteractionType {
  if (!event) {
    return '';
  }
  if (isKeyboardEvent(event)) {
    return 'keyboard';
  }
  if (typeof PointerEvent !== 'undefined' && event instanceof PointerEvent) {
    const pointerType = event.pointerType;
    if (pointerType === 'mouse' || pointerType === 'touch' || pointerType === 'pen') {
      return pointerType;
    }
    // Whitelisted because the value is not reliable: user-event stringifies a missing
    // pointerType into `'undefined'`, which also defeats `isVirtualClick`'s empty-string
    // check above. A click with no real pointer type and no coalesced detail is a
    // keyboard activation.
    return event.detail === 0 ? 'keyboard' : 'mouse';
  }
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    return 'touch';
  }
  if (event instanceof MouseEvent) {
    return 'mouse';
  }
  return '';
}
