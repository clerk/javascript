import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    fontSize: theme.fontSizes.$md,
  },
  variants: {},
}));

export type DlProps = PrimitiveProps<'dl'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Dl = React.forwardRef<HTMLTableCellElement, DlProps>((props, ref) => {
  return (
    <Box
      as='dl'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
