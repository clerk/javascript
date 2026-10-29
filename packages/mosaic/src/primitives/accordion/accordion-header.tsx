'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';

export type AccordionHeaderProps = ComponentProps<'h3'>;

export const AccordionHeader = React.forwardRef<HTMLHeadingElement, AccordionHeaderProps>(
  function AccordionHeader(props, ref) {
    const { render, ...otherProps } = props;

    const defaultProps = {};

    return useRender({
      defaultTagName: 'h3',
      ref,
      render,
      props: mergeProps<'h3'>(defaultProps, otherProps),
    });
  },
);
