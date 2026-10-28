'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useToastContext, useToastRootContext } from './toast-context';

export type ToastActionProps = ComponentProps<'button'>;

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(function ToastAction(props, ref) {
  const { render, ...otherProps } = props;
  const { close } = useToastContext();
  const { toast } = useToastRootContext();

  const { ref: actionRef, ...actionProps } = toast.actionProps ?? {};
  const enabled = toast.actionProps !== undefined || otherProps.children != null || render !== undefined;

  const defaultProps = { type: 'button' } satisfies DefaultProps<'button'>;
  const closeProps = { onClick: () => close(toast.id) } satisfies DefaultProps<'button'>;
  const merged = mergeProps<'button'>(mergeProps<'button'>(defaultProps, actionProps), otherProps);

  return useRender({
    defaultTagName: 'button',
    render,
    enabled,
    ref: [actionRef, ref],
    props: mergeProps<'button'>(merged, closeProps),
  });
});
