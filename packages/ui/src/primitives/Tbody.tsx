import React from 'react';

import { type PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

export type TbodyProps = PrimitiveProps<'tbody'> & Omit<BoxProps, 'as'>;

export const Tbody = React.forwardRef<HTMLTableSectionElement, TbodyProps>((props, ref) => {
  return (
    <Box
      as='tbody'
      {...props}
      ref={ref}
    />
  );
});
