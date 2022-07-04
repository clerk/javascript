import React from 'react';

import { ExclamationCircle, ExclamationTriangle } from '../icons';
import { createVariants, StyleVariants } from '../styledSystem';

const { applyVariants, filterProps } = createVariants(theme => ({
  base: {
    marginRight: theme.space.$2x5,
    width: theme.sizes.$4,
    height: theme.sizes.$4,
  },
  variants: {
    colorScheme: {
      danger: { color: theme.colors.$danger500 },
      warning: { color: theme.colors.$warning500 },
      success: { color: theme.colors.$success500 },
      primary: { color: theme.colors.$primary500 },
    },
  },
}));

type OwnProps = { variant: 'danger' | 'warning' };
export type AlertIconProps = OwnProps & StyleVariants<typeof applyVariants>;

export const AlertIcon = (props: AlertIconProps): JSX.Element => {
  const { variant, ...rest } = props;
  const Icon = variant === 'warning' ? ExclamationCircle : ExclamationTriangle;
  return (
    <Icon
      {...filterProps(rest)}
      css={applyVariants(props)}
    />
  );
};
