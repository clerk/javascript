import type {
  ExtendedRefs,
  FloatingContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import { createContext, type CSSProperties, type RefObject, useContext } from 'react';

import type { TransitionProps } from '../hooks/use-transition';

export interface SelectItem<Value = string> {
  label: string;
  value: Value;
}

export interface SelectContextValue {
  open: boolean;
  items: SelectItem<unknown>[] | undefined;
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
  selectedValues: unknown[];
  /** Labels of values picked while uncontrolled, kept after the items unmount; `null` when controlled. */
  cachedLabels: ReadonlyMap<unknown, string> | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  popupRef: RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  /** Where focus goes when the listbox closes, or `null` to leave focus alone. */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
  valueToLabelRef: React.MutableRefObject<Map<unknown, string>>;
  selectedItemRef: React.MutableRefObject<HTMLElement | null>;
  /** The pointer type of the last press on the trigger, or `'keyboard'`; read when the popup opens. */
  openMethodRef: React.MutableRefObject<string | null>;
  /** Whether the popup is currently overlaying the selected item on the trigger. */
  alignItemWithTrigger: boolean;
  handleSelect: (value: unknown, index: number) => void;
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

export interface SelectHighlightContextValue {
  activeIndex: number | null;
  selectedValues: unknown[];
}
export const SelectHighlightContext = createContext<SelectHighlightContextValue | null>(null);

export function useSelectHighlightContext() {
  const ctx = useContext(SelectHighlightContext);
  if (!ctx) {
    throw new Error('Select.Item must be used within <Select>');
  }
  return ctx;
}

export interface SelectItemsContextValue {
  getItemProps: UseInteractionsReturn['getItemProps'];
  handleSelect: (value: unknown, index: number) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  valueToLabelRef: React.MutableRefObject<Map<unknown, string>>;
  selectedItemRef: React.MutableRefObject<HTMLElement | null>;
}

export const SelectItemsContext = createContext<SelectItemsContextValue | null>(null);

export function useSelectItemsContext() {
  const ctx = useContext(SelectItemsContext);
  if (!ctx) {
    throw new Error('Select.Item must be used within <Select.Root>');
  }
  return ctx;
}
