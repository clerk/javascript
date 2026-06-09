'use client';

import { useMergeRefs } from '@floating-ui/react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export type PopoverPopupProps = ComponentProps<'div'>;

export function PopoverPopup(props: PopoverPopupProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { popupRef, transitionProps } = usePopoverContext();

  const combinedRef = useMergeRefs([popupRef, consumerRef]);

  const defaultProps = {
    'data-cl-slot': 'popover-popup',
    ref: combinedRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
