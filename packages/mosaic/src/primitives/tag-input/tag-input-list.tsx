'use client';

import { type ComponentProps, mergeProps, useRender } from '../utils';

export type TagInputListProps = ComponentProps<'div'>;

export function TagInputList(props: TagInputListProps) {
  const { render, ...otherProps } = props;

  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>({ role: 'list' }, otherProps),
  });
}
