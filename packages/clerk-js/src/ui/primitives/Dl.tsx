import React from 'react';

import type { PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

export type DlProps = PrimitiveProps<'dl'> & Omit<BoxProps, 'as'>;

export const Dl = React.forwardRef<HTMLTableCellElement, DlProps>((props, ref) => {
  return (
    <Box
      as='dl'
      css={{
        margin: 0,
      }}
      {...props}
      ref={ref}
    />
  );
});
