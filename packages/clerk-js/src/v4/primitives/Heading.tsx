import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
    // TODO: Should this be $text?
    color: `${theme.colors.$text500}`,
    margin: 0,
  },
  variants: {
    as: {
      h1: {
        fontStyle: theme.fontStyles.$normal,
        fontWeight: theme.fontWeights.$semibold,
        fontSize: theme.fontSizes.$xl,
        lineHeight: theme.lineHeights.$base,
      },
    },
  },
  defaultVariants: {
    as: 'h1',
  },
}));

export type HeadingProps = PrimitiveProps<'div'> & StyleVariants<typeof applyVariants> & { as?: 'h1' };

export const Heading = (props: HeadingProps) => {
  const { as: As = 'h1', ...rest } = props;
  return (
    <As
      {...rest}
      css={applyVariants(props)}
    />
  );
};
