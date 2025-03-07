import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(_ => ({
  base: {},
  variants: {},
}));

export type DdProps = PrimitiveProps<'dd'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Dd = React.forwardRef<HTMLTableCellElement, DdProps>((props, ref) => {
  return (
    <Box
      as='dd'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
