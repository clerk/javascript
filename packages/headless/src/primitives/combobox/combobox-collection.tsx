'use client';

import type { ReactNode } from 'react';

import { useComboboxContext } from './combobox-context';

export interface ComboboxCollectionProps<Item> {
  items: readonly Item[];
  itemToStringLabel: (item: Item) => string;
  children: (item: Item) => ReactNode;
  empty?: ReactNode;
}

/** Filters items using the search query rather than the selected label. */
export function ComboboxCollection<Item>({ items, itemToStringLabel, children, empty }: ComboboxCollectionProps<Item>) {
  const { filterQuery } = useComboboxContext();
  const query = filterQuery.trim().toLocaleLowerCase();
  const filtered = query ? items.filter(item => itemToStringLabel(item).toLocaleLowerCase().includes(query)) : items;
  return <>{filtered.length ? filtered.map(children) : empty}</>;
}
