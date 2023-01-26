import type { ChangeEventHandler } from 'react';
import React from 'react';

type Unarray<T> = T extends Array<infer U> ? U : T;

type UseSearchInputProps<Items> = {
  items: Items;
  comparator: (term: string, item: Unarray<Items>, itemTerm?: string) => boolean;
  searchTermForItem?: (item: Unarray<Items>) => string;
};

type UseSearchInputReturn<Items> = { filteredItems: Items; searchInputProps: any };

export const useSearchInput = <Items extends Array<any>>(
  props: UseSearchInputProps<Items>,
): UseSearchInputReturn<Items> => {
  const { items, comparator, searchTermForItem } = props;
  const [searchTerm, setSearchTerm] = React.useState('');
  const onChange: ChangeEventHandler<HTMLInputElement> = e => setSearchTerm(e.target.value || '');

  const searchTermMap = React.useMemo(() => {
    type TermMap = Map<Unarray<Items>, string | undefined>;
    return items.reduce((acc, item) => {
      (acc as TermMap).set(item, searchTermForItem?.(item));
      return acc;
    }, new Map() as TermMap) as TermMap;
  }, [items]);

  const filteredItems = React.useMemo(
    () => (searchTerm ? items.filter(i => comparator(searchTerm, i, searchTermMap.get(i))) : items),
    [items, searchTerm],
  ) as Items;

  return { searchInputProps: { onChange, value: searchTerm }, filteredItems };
};
