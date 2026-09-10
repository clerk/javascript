'use client';

import type { ReactNode } from 'react';

import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompleteCollectionProps<Item> {
  items: readonly Item[];
  itemToStringLabel: (item: Item) => string;
  children: (item: Item) => ReactNode;
  empty?: ReactNode;
}

/** Filters items using the search query rather than the selected label. */
export function AutocompleteCollection<Item>({
  items,
  itemToStringLabel,
  children,
  empty,
}: AutocompleteCollectionProps<Item>) {
  const { filterQuery } = useAutocompleteContext();
  const query = filterQuery.trim().toLocaleLowerCase();
  const filtered = query ? items.filter(item => itemToStringLabel(item).toLocaleLowerCase().includes(query)) : items;
  return <>{filtered.length ? filtered.map(children) : empty}</>;
}
