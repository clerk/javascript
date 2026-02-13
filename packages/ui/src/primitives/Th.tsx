import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import { colors } from '../utils/colors';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    textAlign: 'start',
    fontSize: theme.fontSizes.$sm,
    fontWeight: theme.fontWeights.$normal,
    color: colors.setAlpha(theme.colors.$colorForeground, 0.62),
    padding: `${theme.space.$2} ${theme.space.$4}`,
  },
  variants: {},
}));

export type ThProps = PrimitiveProps<'th'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Th = React.forwardRef<HTMLTableCellElement, ThProps>((props, ref) => {
  return (
    <Box
      as='th'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
