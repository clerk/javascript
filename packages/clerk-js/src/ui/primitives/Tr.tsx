import React from 'react';

import { PrimitiveProps } from '../styledSystem';
import { Box, BoxProps } from './Box';

export type TrProps = PrimitiveProps<'tr'> & Omit<BoxProps, 'as'>;

export const Tr = React.forwardRef<HTMLTableCellElement, TrProps>((props, ref) => {
  return (
    <Box
      as='tr'
      {...props}
      ref={ref}
    />
  );
});
