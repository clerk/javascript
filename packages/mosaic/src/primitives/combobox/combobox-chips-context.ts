import { createContext, useContext } from 'react';

import type { CompositeKeyEvent } from '../hooks/use-composite';

export interface ComboboxChipsContextValue {
  registerChip: (value: string, element: HTMLElement | null) => void;
  navigate: (event: CompositeKeyEvent) => void;
  focusLastChip: () => void;
  removeChip: (value: string, focusAfter: 'previous' | 'next') => void;
}

export const ComboboxChipsContext = createContext<ComboboxChipsContextValue | null>(null);

export function useComboboxChipsContext(): ComboboxChipsContextValue {
  const ctx = useContext(ComboboxChipsContext);
  if (!ctx) {
    throw new Error('Combobox.Chip must be used within Combobox.Chips');
  }
  return ctx;
}

export const ComboboxChipContext = createContext<string | null>(null);

export function useComboboxChipValue(): string {
  const value = useContext(ComboboxChipContext);
  if (value === null) {
    throw new Error('Combobox.ChipRemove must be used within Combobox.Chip');
  }
  return value;
}
