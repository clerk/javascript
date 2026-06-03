'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useMenuContext } from './menu-context';

export interface MenuPopupProps extends ComponentProps<'div'> {}

export function MenuPopup(props: MenuPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useMenuContext();

  const defaultProps = {
    'data-cl-slot': 'menu-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
