import type {
  ExtendedRefs,
  FloatingContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import { createContext, type CSSProperties, useContext } from 'react';

import type { TransitionProps } from '../hooks/use-transition';

export interface ComboboxContextValue {
  open: boolean;
  hasValue: boolean;
  clear: () => void;
  inputValue: string;
  filterQuery: string;
  selectedValue: string | null;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  activeIndex: number | null;
  selectedIndex: number | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  valuesByIndexRef: React.MutableRefObject<Map<number, string>>;
  setInlineMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelect: (value: string, index: number, label: string) => void;
  handleInputChange: (value: string) => void;
  setOpen: (open: boolean) => void;
  openOnInputClick: boolean;
  focusInput: () => void;
  popupId: string | undefined;
  mounted: boolean;
  transitionProps: TransitionProps;
}

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);

export function useComboboxContext() {
  const ctx = useContext(ComboboxContext);
  if (!ctx) {
    throw new Error('Combobox compound components must be used within <Combobox>');
  }
  return ctx;
}

export interface ComboboxOptionsContextValue {
  getItemProps: UseInteractionsReturn['getItemProps'];
  handleSelect: (value: string, index: number, label: string) => void;
  refs: ExtendedRefs<ReferenceType>;
  valuesByIndexRef: React.MutableRefObject<Map<number, string>>;
  registerSelectedIndex: (index: number, value: string, label: string, selected: boolean) => (() => void) | undefined;
  registerOption: (index: number) => void;
}

export interface ComboboxHighlightContextValue {
  activeIndex: number | null;
  selectedValue: string | null;
}
export const ComboboxHighlightContext = createContext<ComboboxHighlightContextValue | null>(null);

export function useComboboxHighlightContext() {
  const ctx = useContext(ComboboxHighlightContext);
  if (!ctx) {
    throw new Error('Combobox.Option must be used within <Combobox>');
  }
  return ctx;
}

export const ComboboxOptionsContext = createContext<ComboboxOptionsContextValue | null>(null);

export function useComboboxOptionsContext() {
  const ctx = useContext(ComboboxOptionsContext);
  if (!ctx) {
    throw new Error('Combobox.Option must be used within <Combobox>');
  }
  return ctx;
}
