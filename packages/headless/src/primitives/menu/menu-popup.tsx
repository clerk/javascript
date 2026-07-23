'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useMenuContext } from './menu-context';

export type MenuPopupProps = ComponentProps<'div'>;

export const MenuPopup = React.forwardRef<HTMLDivElement, MenuPopupProps>(function MenuPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useMenuContext();

  const defaultProps = {
    'data-cl-slot': 'menu-popup',
    ...transitionProps,
  };

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [popupRef, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
