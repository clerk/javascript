import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Box } from './Box';

const { applyVariants } = createVariants(theme => ({
  base: {
    // TODO: Should this be $text?
    color: theme.colors.$black,
  },
  variants: {
    as: {
      h1: {
        fontStyle: 'normal',
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

export const Heading = React.forwardRef<HTMLDivElement, HeadingProps>((props, ref) => {
  return (
    <Box
      {...props}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
