'use client';

import { useListItem } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useMenuContext } from './menu-context';

export type MenuTriggerProps = ComponentProps<'button'>;

export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger(props, ref) {
  const { render, ...otherProps } = props;
  const { open, isNested, refs, getReferenceProps, parentContext } = useMenuContext();

  const item = useListItem();

  const state = { open };

  let referenceProps: Record<string, unknown>;

  if (isNested && parentContext) {
    referenceProps = getReferenceProps(parentContext.getItemProps() as React.HTMLProps<HTMLElement>);
  } else {
    referenceProps = getReferenceProps();
  }

  const ownProps = {
    type: 'button',
    'data-cl-slot': 'menu-trigger',
    ...(isNested && {
      role: 'menuitem',
      tabIndex: parentContext?.activeIndex === item.index ? 0 : -1,
    }),
  } satisfies DefaultProps<'button'>;

  const defaultProps = { ...ownProps, ...referenceProps };

  return useRender({
    defaultTagName: 'button',
    render,
    // floating-ui types `setReference` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: [refs.setReference, isNested ? item.ref : null, ref ?? null],
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
