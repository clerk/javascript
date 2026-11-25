'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';

export type SelectSeparatorProps = ComponentProps<'div'>;

export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator(props, ref) {
    const { render, ...otherProps } = props;

    const defaultProps = {
      role: 'presentation' as const,
    };

    return useRender({
      defaultTagName: 'div',
      ref,
      render,
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
