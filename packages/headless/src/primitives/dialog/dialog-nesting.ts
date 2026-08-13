'use client';

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';

/**
 * How a dialog root reaches the dialog root it renders inside, so the two can style the stack
 * they form: the one on top drops its backdrop, the one beneath recedes behind it.
 *
 * Deliberately separate from `isNested`, which reports any FLOATING ancestor — a Menu or a
 * Popover counts. Stacking styles cannot key on that: a dialog opened from a menu item has a
 * floating ancestor but sits on the bare page, and must still paint its own scrim.
 */
export interface DialogNestingContextValue {
  /** Whether the surrounding dialog is itself open. */
  open: boolean;
  /**
   * Called by a dialog rendered inside this one, for as long as it is open. Returns the release.
   * Stable for the lifetime of the root, so registering never churns.
   */
  registerStackedChild: () => () => void;
}

export const DialogNestingContext = createContext<DialogNestingContextValue | null>(null);

/** What a root learns about the stack it belongs to. */
export interface DialogNesting {
  /** Whether this dialog is layered over an open dialog. */
  isStacked: boolean;
  /**
   * How many open dialogs are stacked directly on this one. Counts DIRECT children only — a
   * three-deep stack reports 1 at both lower levels rather than 2 and 1 — which is enough for
   * the single recede step that exists today. Making it cumulative means propagating the count
   * back up the chain, and getting that to settle when two levels mount in one commit.
   */
  stackedChildCount: number;
  /** Provided to this root's children, so a dialog inside it registers against this one. */
  context: DialogNestingContextValue;
}

/**
 * Joins a dialog root to the stack it belongs to, in both directions: up, to report itself to
 * the dialog it renders inside, and down, to count the dialogs that render inside it.
 */
export function useDialogNesting(open: boolean): DialogNesting {
  const parent = useContext(DialogNestingContext);
  const [stackedChildCount, setStackedChildCount] = useState(0);

  const registerStackedChild = useCallback(() => {
    setStackedChildCount(count => count + 1);
    let released = false;
    return () => {
      if (released) {
        return;
      }
      released = true;
      setStackedChildCount(count => count - 1);
    };
  }, []);

  const registerWithParent = parent?.registerStackedChild;

  // Gated on `open` rather than on being mounted: a closing dialog stays mounted for the length
  // of its exit transition, and the surface beneath has to come forward WITH it rather than
  // after it. Depends on the registration function, not the whole context value, so a parent
  // opening or closing does not re-register.
  useLayoutEffect(() => {
    if (!open || !registerWithParent) {
      return;
    }
    return registerWithParent();
  }, [open, registerWithParent]);

  const context = useMemo<DialogNestingContextValue>(
    () => ({ open, registerStackedChild }),
    [open, registerStackedChild],
  );

  return {
    // A closed parent is not something to sit on top of: the child owns the scrim in that case,
    // which is what a confirmation root mounted beside its dialog's portal relies on.
    isStacked: parent !== null && parent.open,
    stackedChildCount,
    context,
  };
}
