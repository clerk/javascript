import React from 'react';

import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

export type TheadProps = PrimitiveProps<'thead'> & Omit<BoxProps, 'as'>;

export const Thead = React.forwardRef<HTMLTableSectionElement, TheadProps>((props, ref) => {
  return (
    <Box
      as='thead'
      {...props}
      ref={ref}
    />
  );
});
