'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export interface PopoverPopupProps extends ComponentProps<'div'> {}

export function PopoverPopup(props: PopoverPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = usePopoverContext();

  const defaultProps = {
    'data-cl-slot': 'popover-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
