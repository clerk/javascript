'use client';

import React, { useLayoutEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useToastRootContext } from './toast-context';

export type ToastTitleProps = Omit<ComponentProps<'h2'>, 'id'>;

export const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastTitleProps>(function ToastTitle(props, ref) {
  const { render, children, ...otherProps } = props;
  const { toast, rootId, setTitleId } = useToastRootContext();

  const id = `${rootId}title`;
  const content = children ?? toast.title;
  const enabled = content != null && content !== false;

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [enabled, id, setTitleId]);

  const defaultProps = { id, children: content } satisfies DefaultProps<'h2'>;

  return useRender({
    defaultTagName: 'h2',
    render,
    enabled,
    ref,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
});
