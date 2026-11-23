'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { usePopoverContext } from './popover-context';

export type PopoverCloseProps = ComponentProps<'button'>;

export const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(props, ref) {
  const { render, ...otherProps } = props;
  const { setOpen } = usePopoverContext();

  const defaultProps = {
    type: 'button' as const,
    onClick() {
      setOpen(false);
    },
  };

  return useRender({
    defaultTagName: 'button',
    ref,
    render,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
