'use client';

import React, { useLayoutEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useToastRootContext } from './toast-context';

export type ToastDescriptionProps = Omit<ComponentProps<'p'>, 'id'>;

export const ToastDescription = React.forwardRef<HTMLParagraphElement, ToastDescriptionProps>(
  function ToastDescription(props, ref) {
    const { render, children, ...otherProps } = props;
    const { toast, rootId, setDescriptionId } = useToastRootContext();

    const id = `${rootId}description`;
    const content = children ?? toast.description;
    const enabled = content != null && content !== false;

    useLayoutEffect(() => {
      if (!enabled) {
        return;
      }
      setDescriptionId(id);
      return () => setDescriptionId(undefined);
    }, [enabled, id, setDescriptionId]);

    const defaultProps = { id, children: content } satisfies DefaultProps<'p'>;

    return useRender({
      defaultTagName: 'p',
      render,
      enabled,
      ref,
      props: mergeProps<'p'>(defaultProps, otherProps),
    });
  },
);
