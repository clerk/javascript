'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';

export type MenuSeparatorProps = ComponentProps<'div'>;

export const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(function MenuSeparator(props, ref) {
  const { render, ...otherProps } = props;

  const defaultProps = {
    role: 'separator' as const,
  };

  return useRender({
    defaultTagName: 'div',
    ref,
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
});
