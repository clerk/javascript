import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import { colors } from '../utils';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    textAlign: 'left',
    fontSize: theme.fontSizes.$xs,
    fontWeight: theme.fontWeights.$normal,
    color: colors.setAlpha(theme.colors.$colorText, 0.62),
    borderBottom: theme.borders.$normal,
    borderColor: theme.colors.$blackAlpha300,
    paddingBottom: theme.space.$2,
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
