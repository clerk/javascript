'use client';

import type { FloatingContext } from '@floating-ui/react';
import React from 'react';

import { type InteractionType, interactionTypeFromEvent } from '../utils/interaction-modality';

/**
 * Where focus goes when the dialog opens (`initialFocus`) or closes (`finalFocus`),
 * mirroring Base UI:
 *
 * - `true` or omitted — the default: first tabbable element on open, the trigger (with the
 *   pointer-close downgrade `useReturnFocus` applies) on close
 * - `false` — do not move focus
 * - a ref — focus that element
 * - a function of the interaction type behind the open/close (`''` when programmatic) —
 *   returns any of the above, with `void`/`null` meaning the default
 */
export type FocusTarget =
  | boolean
  | React.RefObject<HTMLElement | null>
  | ((interactionType: InteractionType) => boolean | void | HTMLElement | null);

/**
 * Resolves `initialFocus` into the `number | ref` form `FloatingFocusManager` takes (a negative
 * index disables the focus move). The function form reads the open event floating-ui has
 * already recorded by the time the popup mounts; it must be pure, as re-renders re-invoke it.
 */
export function useInitialFocus(
  initialFocus: FocusTarget | undefined,
  open: boolean,
  floatingContext: FloatingContext,
): number | React.MutableRefObject<HTMLElement | null> {
  const elementRef = React.useRef<HTMLElement | null>(null);
  return React.useMemo(() => {
    if (!open || initialFocus === undefined || initialFocus === true) {
      return 0;
    }
    if (initialFocus === false) {
      return -1;
    }
    if (typeof initialFocus !== 'function') {
      return initialFocus as React.MutableRefObject<HTMLElement | null>;
    }
    const result = initialFocus(interactionTypeFromEvent(floatingContext.dataRef.current.openEvent));
    if (result === false) {
      return -1;
    }
    if (result instanceof HTMLElement) {
      elementRef.current = result;
      return elementRef;
    }
    return 0;
  }, [open, initialFocus, floatingContext]);
}

/**
 * Resolves `finalFocus` into the `boolean | ref` form `FloatingFocusManager`'s `returnFocus`
 * takes.
 *
 * The function form needs the event behind the close, so it runs inside floating-ui's
 * synchronous `openchange` emit — the root routes every close through
 * `floatingContext.onOpenChange`, and the emit precedes both the state commit and any focus
 * restoration. Only the function's decision is stored; the ref handed to the focus manager
 * materialises it lazily, at restore time, by which point `useReturnFocus` has applied its
 * pointer-close downgrade to the default.
 */
export function useFinalFocus(
  finalFocus: FocusTarget | undefined,
  returnFocusRef: React.MutableRefObject<HTMLElement | null>,
  floatingContext: FloatingContext,
): boolean | React.MutableRefObject<HTMLElement | null> {
  const finalFocusRef = React.useRef(finalFocus);
  React.useLayoutEffect(() => {
    finalFocusRef.current = finalFocus;
  });

  // The function form is resolved when focus is restored, not when the close is requested: a
  // controlled close never passes through floating-ui's `openchange` emit, and a decision taken
  // early would be taken against the page as it was. What the emit does carry — the event behind a
  // close it drove — is kept for the interaction type, and consumed by the restore that follows.
  const closeEventRef = React.useRef<Event | undefined>(undefined);
  const resolvedRef = React.useMemo(
    () => ({
      get current() {
        const target = finalFocusRef.current;
        if (typeof target !== 'function') {
          return returnFocusRef.current;
        }
        const event = closeEventRef.current;
        closeEventRef.current = undefined;
        const result = target(interactionTypeFromEvent(event));
        if (result instanceof HTMLElement) {
          return result;
        }
        return result === false ? null : returnFocusRef.current;
      },
    }),
    [returnFocusRef],
  );

  React.useLayoutEffect(() => {
    function onOpenChange({ open, event }: { open: boolean; event?: Event }) {
      closeEventRef.current = open ? undefined : event;
    }
    floatingContext.events.on('openchange', onOpenChange);
    return () => floatingContext.events.off('openchange', onOpenChange);
  }, [floatingContext.events]);

  if (finalFocus === undefined || finalFocus === true) {
    return returnFocusRef;
  }
  if (finalFocus === false) {
    return false;
  }
  if (typeof finalFocus === 'function') {
    return resolvedRef;
  }
  return finalFocus as React.MutableRefObject<HTMLElement | null>;
}
