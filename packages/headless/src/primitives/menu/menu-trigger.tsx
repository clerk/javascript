'use client';

import { useListItem, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useMenuContext } from './menu-context';

export type MenuTriggerProps = ComponentProps<'button'>;

export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger(props, ref) {
  const { render, ...otherProps } = props;
  const { open, isNested, refs, getReferenceProps, parentContext } = useMenuContext();

  const item = useListItem();

  // floating-ui types `setReference` as a method signature, but at runtime it's
  // a stable callback that doesn't use `this`, so the unbound-method check is a
  // false positive here.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const mergedRef = useMergeRefs([refs.setReference, isNested ? item.ref : null, ref ?? null]);

  const state = { open };

  let referenceProps: Record<string, unknown>;

  if (isNested && parentContext) {
    referenceProps = getReferenceProps(parentContext.getItemProps() as React.HTMLProps<HTMLElement>);
  } else {
    referenceProps = getReferenceProps();
  }

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'menu-trigger',
    ref: mergedRef,
    ...(isNested && {
      role: 'menuitem' as const,
      tabIndex: parentContext?.activeIndex === item.index ? 0 : -1,
    }),
    ...(referenceProps as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
