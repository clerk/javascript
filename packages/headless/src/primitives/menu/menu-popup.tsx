'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useMenuContext } from './menu-context';

export type MenuPopupProps = ComponentProps<'div'>;

export const MenuPopup = React.forwardRef<HTMLDivElement, MenuPopupProps>(function MenuPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useMenuContext();

  const combinedRef = useMergeRefs([popupRef, ref]);

  const defaultProps = {
    'data-cl-slot': 'menu-popup',
    ref: combinedRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
