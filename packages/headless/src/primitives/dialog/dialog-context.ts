import type { ExtendedRefs, FloatingContext, ReferenceType, UseInteractionsReturn } from '@floating-ui/react';
import { createContext, useContext } from 'react';

import type { TransitionProps } from '../../hooks/use-transition';
import type { DialogHandle } from './dialog-handle';

export interface DialogContextValue {
  open: boolean;
  /** The optional event marks the change as user-driven, letting `finalFocus` resolve its interaction type. */
  setOpen: (open: boolean, event?: Event) => void;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  popupRef: React.RefObject<HTMLDivElement | null>;
  /** Where focus goes when the dialog closes, or `null` to leave focus alone. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
  /**
   * The store connecting this root to its triggers — the `handle` prop when one was passed,
   * otherwise a private store the root created. Triggers nested inside the root reach it here;
   * detached triggers hold the same object through their `handle` prop.
   */
  store: DialogHandle;
  modal: boolean;
  /**
   * Whether this dialog opened from inside another floating element, so a stacked overlay can
   * style itself differently from the one beneath it — chiefly so backdrops don't composite into
   * an ever-darker scrim as the stack grows.
   *
   * True for any floating ancestor, not strictly a dialog one: the `FloatingTree` a Menu or
   * Popover establishes counts too. That is the honest reading of what is knowable here, and the
   * cases coincide in practice.
   */
  isNested: boolean;
  /**
   * Whether this dialog is layered over an open DIALOG — the signal the stacking styles key on,
   * where `isNested` is too broad to use. A stacked dialog drops its own backdrop so the stack
   * shows one scrim rather than compositing a darker one per level.
   */
  isStacked: boolean;
  /** How many open dialogs are stacked directly on this one. See `useDialogNesting`. */
  stackedChildCount: number;
  labelId: string;
  descriptionId: string;
  mounted: boolean;
  transitionProps: TransitionProps;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog compound components must be used within <Dialog.Root>');
  }
  return ctx;
}

/** Context access for parts that can also live outside the root — a trigger given a `handle`. */
export function useOptionalDialogContext() {
  return useContext(DialogContext);
}
