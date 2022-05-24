import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
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
  const { as: As = 'h1', ...rest } = props;
  return (
    <As
      {...rest}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
