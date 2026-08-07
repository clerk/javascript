'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { usePopoverContext } from './popover-context';

export type PopoverPopupProps = ComponentProps<'div'>;

export const PopoverPopup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(function PopoverPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = usePopoverContext();

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
