'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import {
  type MenuCheckableItemState,
  useMenuCheckboxItemContext,
  useMenuRadioItemContext,
} from './menu-checkable-context';

export interface MenuItemIndicatorProps extends ComponentProps<'span'> {
  /**
   * Keeps the element in the DOM while its item is unchecked, marked `data-unchecked`.
   *
   * @default false
   */
  keepMounted?: boolean;
}

function useIndicator(
  item: MenuCheckableItemState,
  props: MenuItemIndicatorProps,
  ref: React.ForwardedRef<HTMLSpanElement>,
) {
  const { render, keepMounted = false, ...otherProps } = props;
  const ownProps = { 'aria-hidden': true } satisfies DefaultProps<'span'>;
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    enabled: keepMounted || item.checked,
    state: item,
    stateAttributesMapping: {
      checked: (v: boolean): Record<string, string> => (v ? { 'data-checked': '' } : { 'data-unchecked': '' }),
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: mergeProps<'span'>(ownProps, otherProps),
  });
}

export type MenuCheckboxItemIndicatorProps = MenuItemIndicatorProps;

export const MenuCheckboxItemIndicator = React.forwardRef<HTMLSpanElement, MenuCheckboxItemIndicatorProps>(
  function MenuCheckboxItemIndicator(props, ref) {
    return useIndicator(useMenuCheckboxItemContext(), props, ref);
  },
);

export type MenuRadioItemIndicatorProps = MenuItemIndicatorProps;

export const MenuRadioItemIndicator = React.forwardRef<HTMLSpanElement, MenuRadioItemIndicatorProps>(
  function MenuRadioItemIndicator(props, ref) {
    return useIndicator(useMenuRadioItemContext(), props, ref);
  },
);
