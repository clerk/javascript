import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(_ => ({
  base: {},
  variants: {},
}));

export type DtProps = PrimitiveProps<'dt'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Dt = React.forwardRef<HTMLTableCellElement, DtProps>((props, ref) => {
  return (
    <Box
      as='dt'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
