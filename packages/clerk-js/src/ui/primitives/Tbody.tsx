import React from 'react';

import { common, createVariants, type PrimitiveProps } from '../styledSystem';
import type { BoxProps } from './Box';
import { Box } from './Box';

export type TbodyProps = PrimitiveProps<'tbody'> & Omit<BoxProps, 'as'>;

const { applyVariants, filterProps } = createVariants(theme => {
  return {
    base: {
      width: '100%',
      borderRadius: theme.radii.$lg,
      boxShadow: common.shadows(theme).tableBodyShadow,
    },
    variants: {},
  };
});

export const Tbody = React.forwardRef<HTMLTableSectionElement, TbodyProps>((props, ref) => {
  return (
    <Box
      as='tbody'
      {...filterProps(props)}
      css={applyVariants(props) as any}
      ref={ref}
    />
  );
});
