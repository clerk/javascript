'use client';

import { useListItem, useMergeRefs } from '@floating-ui/react';
import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useMenuContext } from './menu-context';

export interface MenuTriggerProps extends ComponentProps<'button'> {}

export function MenuTrigger(props: MenuTriggerProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { open, isNested, refs, getReferenceProps, parentContext } = useMenuContext();

  const item = useListItem();

  const mergedRef = useMergeRefs([refs.setReference, isNested ? item.ref : null, consumerRef ?? null]);

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
}
