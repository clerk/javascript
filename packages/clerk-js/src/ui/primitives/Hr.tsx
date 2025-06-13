import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    border: 'none',
    height: theme.space.$px,
    backgroundColor: theme.colors.$neutralAlpha100,
  },
  variants: {},
}));

export type HrProps = PrimitiveProps<'hr'> & Omit<BoxProps, 'as'> & StyleVariants<typeof applyVariants>;

export const Hr = React.forwardRef<HTMLHRElement, HrProps>((props, ref) => {
  return (
    <Box
      as='hr'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
