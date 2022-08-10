import React from 'react';

import { AsProp, createVariants, PrimitiveProps, StateProps, StyleVariants } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

const { applyVariants } = createVariants(() => ({
  base: {
    boxSizing: 'inherit',
  },
  variants: {},
}));

export type BoxProps = StateProps & PrimitiveProps<'div'> & AsProp & StyleVariants<typeof applyVariants>;

export const Box = React.forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  // Simply ignore non-native props if they reach here
  const { as: As = 'div', ...rest } = props;
  return (
    <As
      {...applyDataStateProps(rest)}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
