import type {
  ExtendedRefs,
  FloatingContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import { createContext, type CSSProperties, useContext } from 'react';

import type { TransitionProps } from '../../hooks/use-transition';

export interface MenuContextValue {
  open: boolean;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getItemProps: UseInteractionsReturn['getItemProps'];
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  isNested: boolean;
  mounted: boolean;
  transitionProps: TransitionProps;
  parentContext: MenuContextValue | null;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('Menu compound components must be used within <Menu>');
  }
  return ctx;
}
