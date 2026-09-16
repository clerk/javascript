'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';

export type AccordionHeaderProps = ComponentProps<'h3'>;

export function AccordionHeader(props: AccordionHeaderProps) {
  const { render, ...otherProps } = props;

  const defaultProps = {};

  return useRender({
    defaultTagName: 'h3',
    render,
    props: mergeProps<'h3'>(defaultProps, otherProps),
  });
}
