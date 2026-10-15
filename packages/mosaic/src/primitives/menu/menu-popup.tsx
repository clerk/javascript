'use client';

import React from 'react';

import { type ComponentProps, Freeze, mergeProps, useRender } from '../utils';
import { useMenuContext } from './menu-context';

export type MenuPopupProps = ComponentProps<'div'>;

export const MenuPopup = React.forwardRef<HTMLDivElement, MenuPopupProps>(function MenuPopup(props, ref) {
  const { render, children, ...otherProps } = props;
  const { open, popupRef, transitionProps } = useMenuContext();

  const defaultProps = {
    ...transitionProps,
    children: <Freeze frozen={!open}>{children}</Freeze>,
  };

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [popupRef, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
