'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';

export type AccordionHeaderProps = ComponentProps<'h3'>;

export function AccordionHeader(props: AccordionHeaderProps) {
  const { render, ...otherProps } = props;

  const defaultProps = {
    'data-cl-slot': 'accordion-header',
  };

  return useRender({
    defaultTagName: 'h3',
    render,
    props: mergeProps<'h3'>(defaultProps, otherProps),
  });
}
