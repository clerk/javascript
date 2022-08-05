import React from 'react';

import { createVariants, StateProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    display: 'flex',
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
    },
    wrap: {
      noWrap: { flexWrap: 'nowrap' },
      wrap: { flexWrap: 'wrap' },
      wrapReverse: { flexWrap: 'wrap-reverse' },
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
    center: {
      true: { justifyContent: 'center', alignItems: 'center' },
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    wrap: 'noWrap',
  },
}));

export type FlexProps = StateProps & BoxProps & StyleVariants<typeof applyVariants>;

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  return (
    <Box
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});

export const Col = React.forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  return (
    <Flex
      {...props}
      direction='col'
      ref={ref}
    />
  );
});
