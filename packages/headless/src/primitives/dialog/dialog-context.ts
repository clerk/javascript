import type { ExtendedRefs, FloatingContext, ReferenceType, UseInteractionsReturn } from '@floating-ui/react';
import { createContext, useContext } from 'react';

import type { TransitionProps } from '../../hooks/use-transition';

export interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  popupRef: React.RefObject<HTMLDivElement | null>;
  /** Where focus goes when the dialog closes, or `null` to leave focus alone. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
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
