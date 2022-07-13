import React from 'react';

import { createVariants, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  variants: {
    size: {
      sm: { width: theme.sizes.$3, height: theme.sizes.$3 },
      md: { width: theme.sizes.$4, height: theme.sizes.$4 },
      lg: { width: theme.sizes.$5, height: theme.sizes.$5 },
    },
    colorScheme: {
      danger: { color: theme.colors.$danger500 },
      warning: { color: theme.colors.$warning500 },
      neutral: { color: theme.colors.$blackAlpha400 },
    },
  },
  defaultVariants: {
    size: 'md',
  },
}));

export type IconProps = StyleVariants<typeof applyVariants> & {
  icon: React.ComponentType;
};

export const Icon = (props: IconProps): JSX.Element => {
  const { icon: Icon, ...rest } = props;
  return (
    <Icon
      {...filterProps(rest)}
      // @ts-ignore
      css={applyVariants(props)}
    />
  );
};
