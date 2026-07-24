'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useTooltipContext } from './tooltip-context';

export type TooltipPopupProps = ComponentProps<'div'>;

export const TooltipPopup = React.forwardRef<HTMLDivElement, TooltipPopupProps>(function TooltipPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useTooltipContext();

  const defaultProps = {
    ...transitionProps,
  };

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [popupRef, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
