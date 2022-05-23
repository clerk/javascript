import React from 'react';

import { AsProp, createVariants, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants } = createVariants(() => ({
  base: {
    boxSizing: 'border-box',
  },
}));

type BoxProps = PrimitiveProps<'div'> & AsProp & StyleVariants<typeof applyVariants>;

export const Box = React.forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const { as: As = 'div', ...rest } = props;
  return (
    <As
      {...rest}
      css={applyVariants(props)}
      ref={ref}
    />
  );
});
