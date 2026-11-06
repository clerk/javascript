import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Export } from '../../icons/glyphs/export';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { Icon } from '../icon';
import { colors, sizes, styles } from './link.styles';

export type LinkProps = MosaicComponentProps<'a'> & {
  color?: 'primary' | 'neutral' | 'negative';
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function MosaicLink(
  { children, color = 'primary', size = 'md', target, render, xstyle, ...rest },
  ref,
) {
  const external = target === '_blank';
  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('link', { color, size }),
        stylex.props(
          reset.base,
          focusOutline.visible,
          styles.base,
          colors[color],
          sizes[size],
          external && styles.external,
          xstyle,
        ),
        { ...rest, target },
      ),
      children: (
        <>
          {children}
          {external ? (
            <span {...stylex.props(styles.iconSlot)}>
              <Icon
                glyph={Export}
                placement='inline-end'
                size='inherit'
              />
            </span>
          ) : null}
        </>
      ),
    },
  });
});
