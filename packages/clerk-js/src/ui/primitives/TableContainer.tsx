import React from 'react';

import { createVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: { overflowX: 'auto' },
  variants: {},
}));

export type TableContainerProps = BoxProps;

export const TableContainer = React.forwardRef<HTMLTableCellElement, TableContainerProps>((props, ref) => {
  return (
    <Box
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
