'use client';

import { Composite } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, isRef, mergeProps, useRender } from '../utils';
import { useTabsContext } from './tabs-context';

export type TabsListProps = ComponentProps<'div'>;

export function TabsList(props: TabsListProps) {
  const { render, children, ...otherProps } = props;
  const { orientation, setListElement } = useTabsContext();

  return (
    <Composite
      ref={setListElement}
      orientation={orientation}
      render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
        const defaultProps: Record<string, unknown> = {
          role: 'tablist' as const,
          onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key !== 'Home' && event.key !== 'End') {
              return;
            }
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'));
            (event.key === 'Home' ? items.at(0) : items.at(-1))?.focus();
          },
        };

        const merged = mergeProps<'div'>(defaultProps, mergeProps<'div'>(otherProps, compositeProps));

        // Composite may inject a ref via compositeProps; hand it to useRender's ref
        // param (which owns ref-merging) instead of leaving it in props, where
        // useRender's merged ref would overwrite it.
        const { ref: compositeRef, ...mergedProps } = merged;

        // eslint-disable-next-line react-hooks/rules-of-hooks -- floating-ui's Composite calls this render callback synchronously during its own render, so the hook keeps a stable position.
        return useRender({
          defaultTagName: 'div',
          render,
          ref: isRef(compositeRef) ? compositeRef : undefined,
          props: mergedProps,
        });
      }}
    >
      {children}
    </Composite>
  );
}
