import { type ComponentProps, type RenderProp, useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './badge.styles';

export type BadgeProps = Omit<ComponentProps<'span'>, 'render'> & {
  intent?: 'primary' | 'secondary' | 'warning' | 'destructive' | 'success';
  render?: RenderProp<React.ComponentPropsWithRef<'span'>> | React.ReactElement;
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function MosaicBadge(
  { intent = 'primary', render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('badge', { intent }), stylex.props(styles.base, styles[intent]), className, style),
      ...rest,
    },
  });
});
