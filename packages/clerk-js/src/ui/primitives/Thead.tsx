import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {},
  variants: {},
}));

export type THeadProps = PrimitiveProps<'thead'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const THead = React.forwardRef<HTMLTableCellElement, THeadProps>((props, ref) => {
  return (
    <Box
      as='thead'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
