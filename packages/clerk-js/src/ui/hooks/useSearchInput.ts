import React, { ChangeEventHandler } from 'react';

type Unarray<T> = T extends Array<infer U> ? U : T;

type UseSearchInputProps<Items> = {
  items: Items;
  comparator: (term: string, item: Unarray<Items>) => boolean;
};

export const useSearchInput = <Items extends Array<any>>(props: UseSearchInputProps<Items>) => {
  const { items, comparator } = props;
  const [searchTerm, setSearchTerm] = React.useState('');
  const onChange: ChangeEventHandler<HTMLInputElement> = e => setSearchTerm(e.target.value || '');

  const filteredItems = React.useMemo(
    () => items.filter(i => comparator(searchTerm, i)),
    [items, comparator, searchTerm],
  ) as Items;

  return { searchInputProps: { onChange, value: searchTerm }, filteredItems };
};
