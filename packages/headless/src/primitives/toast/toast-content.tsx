'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../../utils';
import { useToastContext, useToastRootContext } from './toast-context';

export type ToastContentProps = ComponentProps<'div'>;

export const ToastContent = React.forwardRef<HTMLDivElement, ToastContentProps>(function ToastContent(props, ref) {
  const { render, ...otherProps } = props;
  const { expanded } = useToastContext();
  const { behind } = useToastRootContext();

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state: { behind, expanded },
    stateAttributesMapping: {
      behind: v => (v ? { 'data-behind': '' } : null),
      expanded: v => (v ? { 'data-expanded': '' } : null),
    },
    props: otherProps,
  });
});
