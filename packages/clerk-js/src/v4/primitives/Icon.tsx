import React from 'react';

import { createVariants, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  variants: {
    size: {
      md: { width: theme.sizes.$4, height: theme.sizes.$4 },
    },
    colorScheme: {
      danger: { color: theme.colors.$danger500 },
      warning: { color: theme.colors.$warning500 },
      gray: { color: theme.colors.$gray300 },
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
      css={applyVariants(props)}
    />
  );
};
