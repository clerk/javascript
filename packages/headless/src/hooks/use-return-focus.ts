'use client';

import type { FloatingContext, OpenChangeReason } from '@floating-ui/react';
import { useEffect, useRef } from 'react';

import { isKeyboardEvent } from '../utils/interaction-modality';

/**
 * The element `FloatingFocusManager` restores focus to when the floating element closes.
 *
 * The trigger is the default, which is what a keyboard user needs. Safari never focuses a
 * button it was clicked on, so after a pointer dismiss the popup is the only thing the page
 * has focused: restoring focus to the trigger then matches `:focus-visible` and paints a ring
 * the user never asked for. A pointer dismiss therefore resolves to `null`, which leaves focus
 * where the pointer left it, the same choice Base UI makes from its close interaction type.
 *
 * Pass the result to `FloatingFocusManager`'s `returnFocus`. On `null` it falls back to the
 * hidden guard element it keeps next to the trigger, so the tab position survives; verify that
 * still holds when upgrading `@floating-ui/react`.
 */
export function useReturnFocus(
  context: Pick<FloatingContext, 'open' | 'events' | 'elements'>,
): React.MutableRefObject<HTMLElement | null> {
  const { open, events, elements } = context;
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const trigger = elements.domReference;

  useEffect(() => {
    if (open) {
      returnFocusRef.current = trigger instanceof HTMLElement ? trigger : null;
    }
  }, [open, trigger]);

  useEffect(() => {
    // Only a pointer dismissal downgrades the default, and a `reason` is what marks a close as
    // one floating-ui's interaction hooks drove (outside press, a trigger press). An event
    // forwarded without a reason — a Close button press — keeps the trigger, and programmatic
    // closes carry no event at all.
    function onOpenChange({ open, event, reason }: { open: boolean; event?: Event; reason?: OpenChangeReason }) {
      if (!open && event && reason && !isKeyboardEvent(event)) {
        returnFocusRef.current = null;
      }
    }

    events.on('openchange', onOpenChange);
    return () => events.off('openchange', onOpenChange);
  }, [events]);

  return returnFocusRef;
}
