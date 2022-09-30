import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    textAlign: 'left',
    fontWeight: theme.fontWeights.$medium,
    borderBottom: theme.borders.$normal,
    borderColor: theme.colors.$blackAlpha300,
  },
  variants: {},
}));

export type ThProps = PrimitiveProps<'th'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Th = React.forwardRef<HTMLTableCellElement, ThProps>((props, ref) => {
  return (
    <Box
      as='th'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
