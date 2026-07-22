import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeProps, themeProps } from '../../props';
import { styles } from './badge.styles';

export interface BadgeProps extends React.ComponentPropsWithRef<'span'> {
  intent?: 'primary' | 'secondary' | 'warning' | 'destructive' | 'success';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function MosaicBadge(
  { intent = 'primary', className, style, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      {...mergeProps(themeProps('badge', { intent }), stylex.props(styles.base, styles[intent]), className, style)}
      {...rest}
    >
      {children}
    </span>
  );
});
