import React from 'react';

import type { StyleVariants } from '../styledSystem';
import { createVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    flexShrink: 0,
  },
  variants: {
    size: {
      xs: { width: theme.sizes.$2x5, height: theme.sizes.$2x5 },
      sm: { width: theme.sizes.$3, height: theme.sizes.$3 },
      md: { width: theme.sizes.$4, height: theme.sizes.$4 },
      lg: { width: theme.sizes.$5, height: theme.sizes.$5 },
    },
    colorScheme: {
      success: { color: theme.colors.$success500 },
      danger: { color: theme.colors.$danger500 },
      warning: { color: theme.colors.$warning500 },
      neutral: { color: theme.colors.$neutralAlpha400 },
    },
  },
  defaultVariants: {
    size: 'md',
  },
}));

// @ts-ignore
export type IconProps = StyleVariants<typeof applyVariants> & {
  icon: React.ComponentType;
};

export const Icon = (props: IconProps): JSX.Element => {
  const { icon: Icon, ...rest } = props;
  return (
    <Icon
      {...filterProps(rest)}
      // @ts-expect-error
      css={applyVariants(props) as any}
    />
  );
};
