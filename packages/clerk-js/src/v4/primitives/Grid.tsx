import React from 'react';

import { createVariants, StateProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    display: 'grid',
  },
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      col: { flexDirection: 'column' },
      rowReverse: { flexDirection: 'row-reverse' },
      columnReverse: { flexDirection: 'column-reverse' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      stretch: { justifyContent: 'stretch' },
    },
    columns: {
      1: { gridTemplateColumns: '1fr' },
      2: { gridTemplateColumns: 'repeat(2, 1fr)' },
      4: { gridTemplateColumns: 'repeat(4, 1fr)' },
      6: { gridTemplateColumns: 'repeat(6, 1fr)' },
    },
    gap: {
      1: { gap: theme.space.$1 },
      2: { gap: theme.space.$2 },
      3: { gap: theme.space.$3 },
      4: { gap: theme.space.$4 },
      5: { gap: theme.space.$5 },
      6: { gap: theme.space.$6 },
      7: { gap: theme.space.$7 },
      8: { gap: theme.space.$8 },
      9: { gap: theme.space.$9 },
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'stretch',
    wrap: 'noWrap',
  },
}));

export type GridProps = StateProps & BoxProps & StyleVariants<typeof applyVariants>;

export const Grid = React.forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  return (
    <Box
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
