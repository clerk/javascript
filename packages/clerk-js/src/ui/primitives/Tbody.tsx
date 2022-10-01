import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {},
  variants: {},
}));

export type TBodyProps = PrimitiveProps<'tbody'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const TBody = React.forwardRef<HTMLTableCellElement, TBodyProps>((props, ref) => {
  return (
    <Box
      as='tbody'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
