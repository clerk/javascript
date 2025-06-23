import React from 'react';

import type { PrimitiveProps, StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';
import { transparentize } from '../utils/colorMix';
import type { BoxProps } from './Box';
import { Box } from './Box';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    textAlign: 'left',
    fontSize: theme.fontSizes.$sm,
    fontWeight: theme.fontWeights.$normal,
    color: transparentize(theme.colors.$colorText, '62%'),
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
