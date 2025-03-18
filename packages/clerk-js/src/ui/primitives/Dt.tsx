import React from 'react';

import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

export type DtProps = PrimitiveProps<'dt'> & Omit<BoxProps, 'as'>;

export const Dt = React.forwardRef<HTMLTableCellElement, DtProps>((props, ref) => {
  return (
    <Box
      as='dt'
      {...props}
      ref={ref}
    />
  );
});
