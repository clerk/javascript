'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';

export type MenuSeparatorProps = ComponentProps<'div'>;

export function MenuSeparator(props: MenuSeparatorProps) {
  const { render, ...otherProps } = props;

  const defaultProps = {
    role: 'separator' as const,
  };

  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
