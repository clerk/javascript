import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {},
  variants: {},
}));

export type TbodyProps = PrimitiveProps<'tbody'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Tbody = React.forwardRef<HTMLTableCellElement, TbodyProps>((props, ref) => {
  return (
    <Box
      as='tbody'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
