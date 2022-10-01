import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {},
  variants: {},
}));

export type TheadProps = PrimitiveProps<'thead'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Thead = React.forwardRef<HTMLTableCellElement, TheadProps>((props, ref) => {
  return (
    <Box
      as='thead'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
