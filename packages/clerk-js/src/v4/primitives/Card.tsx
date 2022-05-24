import React from 'react';

import { AsProp, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minWidth: theme.space.$96,
    padding: `${theme.space.$10} ${theme.space.$8}`,
    borderRadius: theme.radii.$2xl,
    backgroundColor: theme.colors.$cardBackground,
  },
  variants: {
    elevated: {
      true: {
        filter: `drop-shadow(${theme.shadows.$cardDropShadow})`,
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
