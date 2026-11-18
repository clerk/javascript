'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';

export type TagInputListProps = ComponentProps<'div'>;

export const TagInputList = React.forwardRef<HTMLDivElement, TagInputListProps>(function TagInputList(props, ref) {
  const { render, ...otherProps } = props;

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeProps<'div'>({ role: 'list' }, otherProps),
  });
});
