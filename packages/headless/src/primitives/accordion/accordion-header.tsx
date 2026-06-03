'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

export interface AccordionHeaderProps extends ComponentProps<'h3'> {}

export function AccordionHeader(props: AccordionHeaderProps) {
  const { render, ...otherProps } = props;

  const defaultProps = {
    'data-cl-slot': 'accordion-header',
  };

  return renderElement({
    defaultTagName: 'h3',
    render,
    props: mergeProps<'h3'>(defaultProps, otherProps),
  });
}
