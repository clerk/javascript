'use client';

import React from 'react';

import { type ComponentProps, Freeze, mergeProps, useRender } from '../../utils';
import { usePopoverContext } from './popover-context';

export type PopoverPopupProps = ComponentProps<'div'>;

export const PopoverPopup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(function PopoverPopup(props, ref) {
  const { render, children, ...otherProps } = props;
  const { open, popupRef, transitionProps } = usePopoverContext();

  const defaultProps = {
    ...transitionProps,
    // The popup outlives `open` by the length of its exit animation. Whatever closed it has
    // usually changed the data behind it (switching account, picking an item), so the contents
    // hold their last frame on the way out instead of swapping under the animation. The popup
    // element itself stays live, so `data-closed` / `data-ending-style` still land.
    children: <Freeze frozen={!open}>{children}</Freeze>,
  };

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [popupRef, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
