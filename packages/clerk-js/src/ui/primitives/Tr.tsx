import { Theme } from '@clerk/types';
import React from 'react';

import { createVariants, PrimitiveProps } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {},
  variants: {},
}));

export type TrProps = PrimitiveProps<'tr'> & Omit<BoxProps, 'as'>;

export const Tr = React.forwardRef<HTMLTableCellElement, TrProps>((props, ref) => {
  return (
    <Box
      as='tr'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
