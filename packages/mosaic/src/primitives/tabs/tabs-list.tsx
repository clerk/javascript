'use client';

import React, { useState } from 'react';

import { useDirection } from '../direction-provider';
import { CompositeItemsProvider, useComposite, useCompositeItems } from '../hooks/use-composite';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useTabsContext } from './tabs-context';

export type TabsListProps = ComponentProps<'div'>;

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(props, ref) {
  const { render, ...otherProps } = props;
  const { orientation, value } = useTabsContext();
  const direction = useDirection();
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const items = useCompositeItems();

  const composite = useComposite(element, {
    getItems: items.getItems,
    preferred: { key: value, getItem: () => items.getItem(value) },
    orientation,
    rtl: orientation === 'horizontal' && direction === 'rtl',
  });

  return (
    <CompositeItemsProvider value={items}>
      {useRender({
        defaultTagName: 'div',
        render,
        ref: [setElement, ref],
        props: mergeProps<'div'>(
          { role: 'tablist', 'aria-orientation': orientation, onKeyDown: composite.handleKeyDown },
          otherProps,
        ),
      })}
    </CompositeItemsProvider>
  );
});
