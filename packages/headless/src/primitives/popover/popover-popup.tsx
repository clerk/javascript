'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export type PopoverPopupProps = ComponentProps<'div'>;

export const PopoverPopup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(function PopoverPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = usePopoverContext();

  const combinedRef = useMergeRefs([popupRef, ref]);

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
});
