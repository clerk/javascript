import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      borderBottom: theme.borders.$normal,
      borderColor: theme.colors.$blackAlpha300,
      borderCollapse: 'separate',
      borderSpacing: '0',
      'td:not(:first-of-type)': {
        paddingLeft: theme.space.$2,
      },
      'th:not(:first-of-type)': {
        paddingLeft: theme.space.$2,
      },
      'tr > td': {
        paddingBottom: theme.space.$2,
        paddingTop: theme.space.$2,
        paddingLeft: theme.space.$4,
        paddingRight: theme.space.$4,
      },
      'tr > th:first-of-type': {
        paddingLeft: theme.space.$5,
      },
      'thead::after': {
        content: '""',
        display: 'block',
        paddingBottom: theme.space.$2,
      },
      'tbody::after': {
        content: '""',
        display: 'block',
        paddingBottom: theme.space.$2,
      },
      // border-radius for hover
      'tr > td:first-of-type': {
        borderTopLeftRadius: theme.radii.$md,
        borderBottomLeftRadius: theme.radii.$md,
      },
      'tr > td:last-of-type': {
        borderTopRightRadius: theme.radii.$md,
        borderBottomRightRadius: theme.radii.$md,
      },
      width: '100%',
    },
    variants: {},
  };
});

export type TableProps = PrimitiveProps<'table'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Table = React.forwardRef<HTMLTableCellElement, TableProps>((props, ref) => {
  return (
    <Box
      as='table'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
