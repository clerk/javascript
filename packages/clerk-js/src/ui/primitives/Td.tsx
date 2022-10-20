import React from 'react';

import { createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';
import { Box, BoxProps } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    fontSize: theme.fontSizes.$xs,
    fontWeight: theme.fontWeights.$normal,
    color: theme.colors.$colorText,
  },
  variants: {},
}));

export type TdProps = PrimitiveProps<'td'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Td = React.forwardRef<HTMLTableCellElement, TdProps>((props, ref) => {
  return (
    <Box
      as='td'
      {...filterProps(props)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
