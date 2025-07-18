import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import { common } from '../styledSystem/common';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      borderSpacing: '0',
      borderCollapse: 'separate',
      borderWidth: theme.borderWidths.$normal,
      borderStyle: theme.borderStyles.$solid,
      borderColor: theme.colors.$borderAlpha100,
      borderRadius: theme.radii.$lg,
      boxShadow: theme.shadows.$tableBodyShadow,
      width: '100%',
      '>:not([hidden])~:not([hidden])': {
        borderBottomWidth: '0px',
        borderTopWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
        borderColor: theme.colors.$borderAlpha100,
      },
      'td:not(:first-of-type)': {
        paddingLeft: theme.space.$2,
      },
      'th:not(:first-of-type)': {
        paddingLeft: theme.space.$2,
      },
      'tr > td': {
        borderTopWidth: theme.borderWidths.$normal,
        borderTopStyle: theme.borderStyles.$solid,
        borderTopColor: theme.colors.$borderAlpha100,
        paddingBottom: theme.space.$2,
        paddingTop: theme.space.$2,
        paddingLeft: theme.space.$4,
        paddingRight: theme.space.$4,
      },
      'tbody > :not([hidden])~:not([hidden])': {
        borderBottomWidth: '0px',
        borderTopWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
        borderColor: theme.colors.$borderAlpha100,
      },
      'tr:hover td:first-of-type': {
        borderBottomLeftRadius: theme.radii.$lg,
      },
      'tr:hover td:last-of-type': {
        borderBottomRightRadius: theme.radii.$lg,
      },
      'tr > th:first-of-type': {
        paddingLeft: theme.space.$5,
      },
      'thead::after': {
        content: '""',
        display: 'block',
      },
    },
    variants: {
      tableHeadVisuallyHidden: {
        true: {
          thead: {
            ...common.visuallyHidden(),
          },
          'tr:first-of-type td': {
            borderTop: 'none',
          },
        },
      },
    },
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
