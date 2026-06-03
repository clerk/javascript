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
  modal: boolean;
  labelId: string | undefined;
  descriptionId: string | undefined;
  setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
  mounted: boolean;
  transitionProps: TransitionProps;
}

export const DialogContext = createContext<DialogContextValue | null>(null);
export const DialogScopedContext = createContext(false);

export function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog compound components must be used within <Dialog.Root>');
  }
  return ctx;
}
