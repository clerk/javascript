import React from 'react';

import { common, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants } = createVariants(theme => ({
  base: {
    boxSizing: 'border-box',
    color: `${theme.colors.$colorText}`,
    margin: 0,
  },
  variants: {
    as: {
      h1: {
        ...common.textVariants(theme).textXLargeMedium,
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
