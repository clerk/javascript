import React from 'react';

import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

export type DdProps = PrimitiveProps<'dd'> & Omit<BoxProps, 'as'>;

export const Dd = React.forwardRef<HTMLTableCellElement, DdProps>((props, ref) => {
  return (
    <Box
      as='dd'
      {...props}
      ref={ref}
    />
  );
});
