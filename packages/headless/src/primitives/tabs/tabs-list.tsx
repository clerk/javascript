'use client';

import { Composite } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
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

        // Composite may inject a ref via compositeProps; hand it to useRender's ref
        // param (which owns ref-merging) instead of leaving it in props, where
        // useRender's merged ref would overwrite it.
        const { ref: compositeRef, ...mergedProps } = merged;

        // floating-ui's Composite invokes this render callback synchronously and
        // unconditionally during its own render (see renderJsx), so useRender runs in a
        // stable hook position on the Composite fiber. The rule can't see that.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useRender({
          defaultTagName: 'div',
          render,
          // SAFETY: mergeProps returns Record<string, unknown>; a ref Composite injected
          // is a valid React ref at runtime.
          ref: compositeRef as React.Ref<unknown>,
          props: mergedProps,
        });
      }}
    >
      {children}
    </Composite>
  );
}
