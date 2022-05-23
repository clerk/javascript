import React from 'react';

import { AsProp, createStyles, PrimitiveProps, StyleVariants } from '../styledSystem';

const { applyVariants } = createStyles(() => ({
  base: {
    boxSizing: 'border-box',
  },
  // variants: { size: { small: {} } },
  // variants: {
  //   size: {
  //     small: { padding: theme.space.$1x5, margin: theme.space.$1x5 },
  //     medium: { padding: theme.space.$3x5, margin: theme.space.$3x5 },
  //     large: { padding: theme.space.$8, margin: theme.space.$8 },
  //   },
  //   color: {
  //     red: { backgroundColor: theme.colors.$danger500 },
  //     green: { backgroundColor: theme.colors.$success500 },
  //   },
  //   rounded: {
  //     true: { borderRadius: theme.radii.$3xl },
  //   },
  // },
  // compoundVariants: [
  //   { condition: { color: 'red', rounded: true }, styles: { backgroundColor: theme.colors.$warning500 } },
  // ],
  // defaultVariants: {
  //   color: 'green',
  //   rounded: true,
  // },
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
