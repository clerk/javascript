'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTooltipContext } from './tooltip-context';

export interface TooltipPopupProps extends ComponentProps<'div'> {}

export function TooltipPopup(props: TooltipPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useTooltipContext();

  const defaultProps = {
    'data-cl-slot': 'tooltip-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
