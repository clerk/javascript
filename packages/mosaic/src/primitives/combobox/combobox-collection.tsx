'use client';

import type { ReactNode } from 'react';

import { useComboboxContext } from './combobox-context';

export interface ComboboxCollectionProps<Item> {
  /** Renders one matching item. Annotate `item` with the type of `Root`'s `items`. */
  children: (item: Item) => ReactNode;
}

/** Renders the root's `items` that match the search query rather than the selected label. */
export function ComboboxCollection<Item>({ children }: ComboboxCollectionProps<Item>) {
  const { filteredItems } = useComboboxContext();
  // eslint-disable-next-line typescript/consistent-type-assertions -- Context cannot carry Root's item type to a sibling; the caller annotates `children` with it.
  const items = filteredItems as readonly Item[];
  return <>{items.map(children)}</>;
}
