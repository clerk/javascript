'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTooltipContext } from './tooltip-context';

export type TooltipPopupProps = ComponentProps<'div'>;

export const TooltipPopup = React.forwardRef<HTMLDivElement, TooltipPopupProps>(function TooltipPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useTooltipContext();

  const combinedRef = useMergeRefs([popupRef, ref]);

  const defaultProps = {
    'data-cl-slot': 'tooltip-popup',
    ref: combinedRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
