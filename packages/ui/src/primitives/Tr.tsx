import React from 'react';

import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

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
