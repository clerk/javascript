'use client';

import type { FloatingContext, FloatingTreeType, OpenChangeReason } from '@floating-ui/react';
import { useFloatingParentNodeId, useFloatingTree } from '@floating-ui/react';
import { useEffect, useMemo, useRef } from 'react';

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
 * A floating element opened from inside another one — a dialog from a menu item — may have no
 * trigger of its own, or one that is gone by the time it closes: the item unmounted with the menu.
 * Focus then goes to the nearest ancestor in the floating tree whose reference is still on the
 * page, which for a menu is its trigger. Resolved lazily, at restore time, since that is when it is
 * known whether the trigger survived.
 *
 * Pass the result to `FloatingFocusManager`'s `returnFocus`. On `null` it falls back to the
 * hidden guard element it keeps next to the trigger, so the tab position survives; verify that
 * still holds when upgrading `@floating-ui/react`.
 */
export function useReturnFocus(
  context: Pick<FloatingContext, 'open' | 'events' | 'elements'>,
): React.MutableRefObject<HTMLElement | null> {
  const { open, events, elements } = context;
  const tree = useFloatingTree();
  const parentId = useFloatingParentNodeId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const dismissedByPointerRef = useRef(false);
  const trigger = elements.domReference;

  useEffect(() => {
    if (open) {
      triggerRef.current = trigger instanceof HTMLElement ? trigger : null;
      dismissedByPointerRef.current = false;
    }
  }, [open, trigger]);

  useEffect(() => {
    // Only a pointer dismissal downgrades the default, and a `reason` is what marks a close as
    // one floating-ui's interaction hooks drove (outside press, a trigger press). An event
    // forwarded without a reason — a Close button press — keeps the trigger, and programmatic
    // closes carry no event at all.
    function onOpenChange({ open, event, reason }: { open: boolean; event?: Event; reason?: OpenChangeReason }) {
      if (!open && event && reason && !isKeyboardEvent(event)) {
        dismissedByPointerRef.current = true;
      }
    }

    events.on('openchange', onOpenChange);
    return () => events.off('openchange', onOpenChange);
  }, [events]);

  return useMemo(
    () => ({
      get current() {
        if (dismissedByPointerRef.current) {
          return null;
        }
        const own = triggerRef.current;
        if (own?.isConnected) {
          return own;
        }
        return ancestorReference(tree, parentId);
      },
      set current(element: HTMLElement | null) {
        triggerRef.current = element;
      },
    }),
    [tree, parentId],
  );
}

function ancestorReference(tree: FloatingTreeType | null, parentId: string | null): HTMLElement | null {
  let id = parentId;
  while (tree && id != null) {
    const node = tree.nodesRef.current.find(candidate => candidate.id === id);
    if (!node) {
      return null;
    }
    const reference = node.context?.elements.domReference;
    if (reference instanceof HTMLElement && reference.isConnected) {
      return reference;
    }
    id = node.parentId ?? null;
  }
  return null;
}
