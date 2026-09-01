import type { DialogOpenChangeDetails } from '@clerk/headless/dialog';
import React from 'react';

import type { ConfirmHandle, ConfirmOptions } from './confirm-handle';

export interface UseConfirmedCloseOptions {
  /** The handle shared with the `<Dialog.Confirm>` rendered inside the guarded dialog. */
  handle: ConfirmHandle;
  /**
   * Whether closing needs confirming, evaluated at the moment of each close request — typically
   * "is this form dirty". Return `false` and the close commits immediately, with no interruption.
   */
  when: () => boolean;
  /** Commits the open state. The guarded dialog's own `onOpenChange`, usually a `setOpen`. */
  onOpenChange: (open: boolean, details: DialogOpenChangeDetails) => void;
  /** What to ask when `when()` returns true. */
  confirm: ConfirmOptions;
}

/** A close the user never asked for: the one this hook commits after the action is confirmed. */
const PROGRAMMATIC_DETAILS: DialogOpenChangeDetails = { trigger: null, triggerId: null, event: undefined };

/**
 * Guards a dialog's close behind a confirmation, returning the `onOpenChange` to hand it.
 *
 * ```tsx
 * const onOpenChange = useConfirmedClose({
 *   handle: confirm,
 *   when: () => value !== '',
 *   onOpenChange: setOpen,
 *   confirm: { title: 'Discard changes?', description: '…', actionLabel: 'Discard' },
 * });
 *
 * <Dialog.Root open={open} onOpenChange={onOpenChange} closedBy='closerequest'>
 *   <Dialog.Popup>
 *     …
 *     <Dialog.Confirm handle={confirm} />
 *   </Dialog.Popup>
 * </Dialog.Root>
 * ```
 *
 * **The dialog must be controlled.** A veto is the absence of a commit, and an uncontrolled dialog
 * has already committed internally by the time `onOpenChange` runs — there would be nothing left to
 * decline.
 *
 * **What it covers is every close the dialog itself owns**: Escape, an outside press where
 * `closedBy` allows one, `Dialog.CloseButton`, `Dialog.Close`, and a `handle.close()`. All of them
 * funnel through `onOpenChange`, so one branch here answers them all. What it cannot cover is a button wired to your own `setOpen(false)` — that never reaches the
 * dialog, so it bypasses the question silently. Route those through `Dialog.Close` instead.
 */
export function useConfirmedClose({ handle, when, onOpenChange, confirm }: UseConfirmedCloseOptions) {
  // Read through a ref so the returned callback is stable across renders: it is handed to a
  // dialog that would otherwise see a new `onOpenChange` identity on every keystroke of the very
  // form whose dirtiness `when` is reporting on.
  const latest = React.useRef({ when, onOpenChange, confirm });
  React.useLayoutEffect(() => {
    latest.current = { when, onOpenChange, confirm };
  });

  return React.useCallback(
    (open: boolean, details: DialogOpenChangeDetails) => {
      if (open || !latest.current.when()) {
        latest.current.onOpenChange(open, details);
        return;
      }
      // The veto: return without committing, so the dialog stays open behind the question. The
      // close is re-issued from here only if the answer is yes — and it is a fresh close rather
      // than the original, whose event belongs to an interaction that has long since finished.
      void handle.show(latest.current.confirm).then(confirmed => {
        if (confirmed) {
          latest.current.onOpenChange(false, PROGRAMMATIC_DETAILS);
        }
      });
    },
    [handle],
  );
}
