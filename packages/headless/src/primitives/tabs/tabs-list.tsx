'use client';

import { Composite } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTabsContext } from './tabs-context';

export type TabsListProps = ComponentProps<'div'>;

export function TabsList(props: TabsListProps) {
  const { render, children, ...otherProps } = props;
  const { orientation, listRef } = useTabsContext();

  return (
    <Composite
      ref={listRef}
      orientation={orientation}
      render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
        const defaultProps: Record<string, unknown> = {
          'data-cl-slot': 'tabs-list',
          role: 'tablist' as const,
          onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key !== 'Home' && event.key !== 'End') {
              return;
            }
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'));
            if (items.length === 0) {
              return;
            }
            const target = event.key === 'Home' ? items[0] : items[items.length - 1];
            target.focus();
          },
        };

        const merged = mergeProps<'div'>(
          defaultProps,
          mergeProps<'div'>(otherProps, compositeProps as Record<string, unknown>),
        );

        return renderElement({
          defaultTagName: 'div',
          render,
          props: merged,
        });
      }}
    >
      {children}
    </Composite>
  );
}
