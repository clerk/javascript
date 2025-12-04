import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    fontSize: theme.fontSizes.$xs,
    fontWeight: theme.fontWeights.$normal,
    color: theme.colors.$colorForeground,
  },
  variants: {},
}));

export type TdProps = PrimitiveProps<'td'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Td = React.forwardRef<HTMLTableCellElement, TdProps>((props, ref) => {
  return (
    <Box
      as='td'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
