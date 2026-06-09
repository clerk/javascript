'use client';

import { useMergeRefs } from '@floating-ui/react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTooltipContext } from './tooltip-context';

export type TooltipPopupProps = ComponentProps<'div'>;

export function TooltipPopup(props: TooltipPopupProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { popupRef, transitionProps } = useTooltipContext();

  const combinedRef = useMergeRefs([popupRef, consumerRef]);

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
}
