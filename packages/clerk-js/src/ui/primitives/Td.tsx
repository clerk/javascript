import React from 'react';

import { PrimitiveProps } from '../styledSystem';
import { Box, BoxProps } from './Box';

export type TdProps = PrimitiveProps<'td'> & Omit<BoxProps, 'as'>;

export const Td = React.forwardRef<HTMLTableCellElement, TdProps>((props, ref) => {
  return (
    <Box
      as='td'
      {...props}
      ref={ref}
    />
  );
});
