'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

export type MenuSeparatorProps = ComponentProps<'div'>;

export function MenuSeparator(props: MenuSeparatorProps) {
  const { render, ...otherProps } = props;

  const defaultProps = {
    'data-cl-slot': 'menu-separator',
    role: 'separator' as const,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
