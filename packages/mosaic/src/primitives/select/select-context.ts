import type {
  ExtendedRefs,
  FloatingContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import { createContext, type CSSProperties, type RefObject, useContext } from 'react';

import type { TransitionProps } from '../hooks/use-transition';
import type { Store } from '../utils';

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
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  multiple: boolean;
  /** The selection in the order it was made; at most one value unless `multiple`. */
  selectedValues: string[];
  /** Labels of values picked while uncontrolled, kept after the options unmount; `null` when controlled. */
  cachedLabels: ReadonlyMap<string, string> | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  popupRef: RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  /** Where focus goes when the listbox closes, or `null` to leave focus alone. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
  valueToLabelRef: React.MutableRefObject<Map<string, string>>;
  selectedItemRef: React.MutableRefObject<HTMLElement | null>;
  /** The pointer type of the last press on the trigger, or `'keyboard'`; read when the popup opens. */
  openMethodRef: React.MutableRefObject<string | null>;
  /** Whether the popup is currently overlaying the selected option on the trigger. */
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

export interface SelectHighlight {
  activeIndex: number | null;
  selectedValues: string[];
}

export interface SelectOptionsContextValue {
  store: Store<SelectHighlight>;
  getItemProps: UseInteractionsReturn['getItemProps'];
  handleSelect: (value: string, index: number) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  valueToLabelRef: React.MutableRefObject<Map<string, string>>;
  selectedItemRef: React.MutableRefObject<HTMLElement | null>;
}

export const SelectOptionsContext = createContext<SelectOptionsContextValue | null>(null);

export function useSelectOptionsContext() {
  const ctx = useContext(SelectOptionsContext);
  if (!ctx) {
    throw new Error('Select.Option must be used within <Select.Root>');
  }
  return ctx;
}
