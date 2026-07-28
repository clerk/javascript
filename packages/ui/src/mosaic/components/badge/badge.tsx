import { type ComponentProps, type RenderProp, useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { colors, styles } from './badge.styles';

export type BadgeProps = Omit<ComponentProps<'span'>, 'render'> & {
  color?: 'primary' | 'neutral' | 'warning' | 'negative' | 'positive';
  render?: RenderProp<React.ComponentPropsWithRef<'span'>> | React.ReactElement;
};

/**
 * A small label that annotates adjacent content with a status or category. Renders a
 * `span` by default and forwards its ref; `color` sets the semantic color and `render`
 * swaps the element for polymorphism (e.g. a link).
 *
 * @example
 * // Default (primary)
 * <Badge>New</Badge>
 *
 * @example
 * // Semantic color
 * <Badge color='positive'>Active</Badge>
 * <Badge color='negative'>Failed</Badge>
 *
 * @example
 * // Polymorphic: render as a link
 * <Badge render={<a href='/billing' />}>Upgrade</Badge>
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function MosaicBadge(
  { color = 'primary', render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('badge', { color }), stylex.props(styles.base, colors[color]), className, style),
      ...rest,
    },
  });
});
