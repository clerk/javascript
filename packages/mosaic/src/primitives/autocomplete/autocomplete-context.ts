import type {
  ExtendedRefs,
  FloatingContext,
  Placement,
  ReferenceType,
  UseInteractionsReturn,
} from '@floating-ui/react';
import { createContext, type CSSProperties, useContext } from 'react';

import type { TransitionProps } from '../hooks/use-transition';
import type { Store } from '../utils';

export interface AutocompleteContextValue {
  open: boolean;
  inputValue: string;
  selectedValue: string | undefined;
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
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  valuesByIndexRef: React.MutableRefObject<Map<number, string>>;
  setInlineMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelect: (value: string, index: number, label: string) => void;
  handleInputChange: (value: string) => void;
  mounted: boolean;
  transitionProps: TransitionProps;
}

export const AutocompleteContext = createContext<AutocompleteContextValue | null>(null);

export function useAutocompleteContext() {
  const ctx = useContext(AutocompleteContext);
  if (!ctx) {
    throw new Error('Autocomplete compound components must be used within <Autocomplete>');
  }
  return ctx;
}

export interface AutocompleteOptionsContextValue {
  activeIndexStore: Store<number | null>;
  selectedValue: string | undefined;
  getItemProps: UseInteractionsReturn['getItemProps'];
  handleSelect: (value: string, index: number, label: string) => void;
  refs: ExtendedRefs<ReferenceType>;
  valuesByIndexRef: React.MutableRefObject<Map<number, string>>;
  registerSelectedIndex: (index: number, selected: boolean) => void;
}

export const AutocompleteOptionsContext = createContext<AutocompleteOptionsContextValue | null>(null);

export function useAutocompleteOptionsContext() {
  const ctx = useContext(AutocompleteOptionsContext);
  if (!ctx) {
    throw new Error('Autocomplete.Option must be used within <Autocomplete>');
  }
  return ctx;
}
