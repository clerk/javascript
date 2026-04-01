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
      borderColor: theme.colors.$borderAlpha150,
      borderRadius: theme.radii.$lg,
      width: '100%',
      '>:not([hidden])~:not([hidden])': {
        borderBottomWidth: '0px',
        borderTopWidth: '1px',
        borderStyle: 'solid',
        borderInlineStartWidth: '0px',
        borderInlineEndWidth: '0px',
        borderColor: theme.colors.$borderAlpha150,
      },
      'td:not(:first-of-type)': {
        paddingInlineStart: theme.space.$2,
      },
      'th:not(:first-of-type)': {
        paddingInlineStart: theme.space.$2,
      },
      'tr > td': {
        borderTopWidth: theme.borderWidths.$normal,
        borderTopStyle: theme.borderStyles.$solid,
        borderTopColor: theme.colors.$borderAlpha150,
        paddingBottom: theme.space.$2,
        paddingTop: theme.space.$2,
        paddingInlineStart: theme.space.$4,
        paddingInlineEnd: theme.space.$4,
      },
      'tbody > :not([hidden])~:not([hidden])': {
        borderBottomWidth: '0px',
        borderTopWidth: '1px',
        borderStyle: 'solid',
        borderInlineStartWidth: '0px',
        borderInlineEndWidth: '0px',
        borderColor: theme.colors.$borderAlpha150,
      },
      'tr:hover td:first-of-type': {
        borderEndStartRadius: theme.radii.$lg,
      },
      'tr:hover td:last-of-type': {
        borderEndEndRadius: theme.radii.$lg,
      },
      'tr > th:first-of-type': {
        paddingInlineStart: theme.space.$5,
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
