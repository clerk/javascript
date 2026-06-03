'use client';

import { useFloatingTree, useListItem } from '@floating-ui/react';
import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useMenuContext } from './menu-context';

export interface MenuItemProps extends ComponentProps<'button'> {
  label: string;
  disabled?: boolean;
  closeOnClick?: boolean;
}

export function MenuItem(props: MenuItemProps) {
  const { render, label, disabled, closeOnClick = true, ...otherProps } = props;
  const { activeIndex, getItemProps } = useMenuContext();
  const tree = useFloatingTree();
  const item = useListItem({ label: disabled ? null : label });
  const isActive = item.index === activeIndex;

  const state = {
    active: isActive,
    disabled: !!disabled,
  };

  const defaultProps = {
    'data-cl-slot': 'menu-item',
    type: 'button' as const,
    ref: item.ref,
    role: 'menuitem' as const,
    tabIndex: isActive ? 0 : -1,
    ...(disabled && { 'aria-disabled': true as const }),
    ...(getItemProps({
      onClick() {
        if (!disabled && closeOnClick) {
          tree?.events.emit('click');
        }
      },
    }) as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      active: (v: boolean) => (v ? { 'data-cl-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
