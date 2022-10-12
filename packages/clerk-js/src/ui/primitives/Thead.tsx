import React from 'react';

import { PrimitiveProps } from '../styledSystem';
import { Box, BoxProps } from './Box';

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
