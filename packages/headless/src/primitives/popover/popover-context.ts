import type {
  ExtendedRefs,
  FloatingContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import { createContext, type CSSProperties, useContext } from 'react';

import type { TransitionProps } from '../../hooks/use-transition';

export interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  popupRef: React.RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  modal: boolean;
  labelId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (v: boolean) => void;
  setHasDescription: (v: boolean) => void;
  mounted: boolean;
  transitionProps: TransitionProps;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext() {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error('Popover compound components must be used within <Popover.Root>');
  }
  return ctx;
}
