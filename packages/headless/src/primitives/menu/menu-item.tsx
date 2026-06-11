'use client';

import { useFloatingTree, useListItem, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useMenuContext } from './menu-context';

export interface MenuItemProps extends ComponentProps<'button'> {
  label: string;
  disabled?: boolean;
  closeOnClick?: boolean;
}

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(props, ref) {
  const { render, label, disabled, closeOnClick = true, onClick: consumerOnClick, ...otherProps } = props;
  // When disabled, omit the consumer onClick entirely so mergeProps doesn't chain it.
  // When not disabled, add it back only if it's a function (avoids spreading onClick: undefined
  // which would overwrite the internal getItemProps handler via mergeProps).
  const safeOtherProps =
    !disabled && typeof consumerOnClick === 'function' ? { ...otherProps, onClick: consumerOnClick } : otherProps;
  const { activeIndex, getItemProps } = useMenuContext();
  const tree = useFloatingTree();
  const item = useListItem({ label: disabled ? null : label });
  const isActive = item.index === activeIndex;

  const combinedRef = useMergeRefs([item.ref, ref]);

  const state = {
    active: isActive,
    disabled: !!disabled,
  };

  const defaultProps = {
    'data-cl-slot': 'menu-item',
    type: 'button' as const,
    ref: combinedRef,
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
    props: mergeProps<'button'>(defaultProps, safeOtherProps),
  });
});
