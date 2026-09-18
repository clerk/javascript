'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useToastContext, useToastRootContext } from './toast-context';

export type ToastCloseProps = ComponentProps<'button'>;

export const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(function ToastClose(props, ref) {
  const { render, ...otherProps } = props;
  const { close } = useToastContext();
  const { toast } = useToastRootContext();

  const defaultProps = {
    type: 'button',
    onClick: () => close(toast.id),
  } satisfies DefaultProps<'button'>;

  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
