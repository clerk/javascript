import React from 'react';

import { createVariants, PrimitiveProps } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      borderCollapse: 'collapse',
      'td:not(:first-child)': {
        paddingLeft: theme.sizes.$2,
      },
      'th:not(:first-child)': {
        paddingLeft: theme.sizes.$2,
      },
      'tr:not(:last-child)>td': {
        paddingBottom: theme.sizes.$2,
      },
    },
    variants: {},
  };
});

export type TableProps = PrimitiveProps<'table'> & Omit<BoxProps, 'as'>;

export const Table = React.forwardRef<HTMLTableCellElement, TableProps>((props, ref) => {
  return (
    <Box
      as='table'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
