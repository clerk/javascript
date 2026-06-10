import type {
  ExtendedRefs,
  FloatingContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import { createContext, type CSSProperties, type RefObject, useContext } from 'react';

import type { TransitionProps } from '../../hooks/use-transition';

export interface SelectItem {
  label: string;
  value: string;
}

export interface SelectContextValue {
  open: boolean;
  items: SelectItem[] | undefined;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getItemProps: UseInteractionsReturn['getItemProps'];
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  selectedIndex: number | null;
  selectedValue: string | undefined;
  selectedLabel: string | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  popupRef: RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  valueToLabelRef: React.MutableRefObject<Map<string, string>>;
  selectedItemRef: React.MutableRefObject<HTMLElement | null>;
  alignItemWithTrigger: boolean;
  handleSelect: (value: string, index: number) => void;
  mounted: boolean;
  transitionProps: TransitionProps;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('Select compound components must be used within <Select.Root>');
  }
  return ctx;
}
