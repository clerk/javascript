'use client';

import { useMergeRefs } from '@floating-ui/react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useMenuContext } from './menu-context';

export type MenuPopupProps = ComponentProps<'div'>;

export function MenuPopup(props: MenuPopupProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { popupRef, transitionProps } = useMenuContext();

  const combinedRef = useMergeRefs([popupRef, consumerRef]);

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
}
