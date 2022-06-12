import React from 'react';

import { AsProp, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    willChange: 'transform, opacity, height',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minWidth: theme.space.$100,
    maxWidth: theme.space.$100,
    padding: `${theme.space.$9x5} ${theme.space.$8} ${theme.space.$12} ${theme.space.$8}`,
    borderRadius: theme.radii.$2xl,
    backgroundColor: theme.colors.$background500,
    transitionProperty: theme.transitionProperty.$common,
    transitionDuration: '200ms',
  },
  variants: {
    elevated: {
      true: {
        // filter: `drop-shadow(${theme.shadows.$cardDropShadow})`,
        boxShadow: theme.shadows.$cardDropShadow,
      },
    },
  },
  defaultVariants: {
    elevated: true,
  },
}));

type CardProps = PrimitiveProps<'div'> & AsProp & StyleVariants<typeof applyVariants>;

const Card = (props: CardProps): JSX.Element => {
  return (
    <div
      {...filterProps(props)}
      css={applyVariants(props)}
    />
  );
};

export { Card };
