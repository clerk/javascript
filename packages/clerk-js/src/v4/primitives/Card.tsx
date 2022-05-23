import React from 'react';

import { AsProp, createStyles, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createStyles(theme => ({
  base: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minWidth: theme.sizes.$96,
    py: theme.sizes.$10,
    px: theme.sizes.$8,
    borderRadius: theme.radii.$2xl,
  },
  variants: {
    elevated: {
      true: { boxShadow: theme.shadows.$boxShadow1 },
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
