/**
 * @file Badge.tsx
 * @input Uses React, HTMLAttributes
 * @output Exports Badge component, BadgeProps, BadgeVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Badge/Badge.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Badge/Badge.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Badge/index.ts (exports if types change)
 * - /apps/storybook/stories/Badge.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Badge/ (showcase blocks)
 */

import { type ComponentProps, type RenderProp, useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { colors, styles } from './badge.styles';

export type BadgeProps = Omit<ComponentProps<'span'>, 'render'> & {
  color?: 'primary' | 'neutral' | 'warning' | 'negative' | 'positive';
  render?: RenderProp<React.ComponentPropsWithRef<'span'>> | React.ReactElement;
};

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
