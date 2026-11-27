'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { fill } from '../../localization/messages';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { mediaSizes } from '../../styles/media-size.styles';
import { reset } from '../../styles/reset.styles';
import { AvatarContext } from '../avatar/avatar.context';
import { shapes, sizes as avatarSizes, styles as avatarStyles } from '../avatar/avatar.styles';
import { itemShapes, sizes, styles } from './avatar-group.styles';

type AvatarGroupShape = 'circle' | 'square';
type AvatarGroupSize = 'xs' | 'sm' | 'md' | 'lg';

interface AvatarGroupContextValue {
  shape: AvatarGroupShape;
  size: AvatarGroupSize;
}

const AvatarGroupContext = React.createContext<AvatarGroupContextValue | null>(null);

export interface AvatarGroupProps extends MosaicElementProps<'div'> {
  shape?: AvatarGroupShape;
  size?: AvatarGroupSize;
}

const AvatarGroupRoot = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function MosaicAvatarGroupRoot(
  { shape = 'circle', size = 'md', xstyle, ...rest },
  ref,
) {
  const group = React.useMemo<AvatarGroupContextValue>(() => ({ shape, size }), [shape, size]);
  const avatarDefaults = React.useMemo(
    () => ({ shape, size, styles: [itemShapes[shape], styles.item] }),
    [shape, size],
  );

  return (
    <AvatarGroupContext.Provider value={group}>
      <AvatarContext.Provider value={avatarDefaults}>
        <div
          ref={ref}
          role='group'
          {...mergeStyleProps(
            themeProps('avatar-group', { shape, size }),
            stylex.props(reset.base, styles.root, sizes[size], xstyle),
            rest,
          )}
        />
      </AvatarContext.Provider>
    </AvatarGroupContext.Provider>
  );
});

export interface AvatarGroupOverflowProps extends MosaicComponentProps<'span'> {
  count: number;
  /** The accessible name, with `{count}` filled in. */
  label?: string;
}

const AvatarGroupOverflow = React.forwardRef<HTMLSpanElement, AvatarGroupOverflowProps>(
  function MosaicAvatarGroupOverflow({ count, label = '{count} more', render, children, xstyle, ...rest }, ref) {
    const group = React.useContext(AvatarGroupContext);
    if (!group) {
      throw new Error('<AvatarGroup.Overflow> must be rendered inside <AvatarGroup.Root>');
    }
    const { shape, size } = group;
    const interactive = Boolean(render);

    return useRender({
      defaultTagName: 'span',
      render,
      ref,
      enabled: count > 0,
      props: {
        role: interactive ? undefined : 'img',
        'aria-label': fill(label, { count }),
        children: children ?? `+${count}`,
        ...mergeStyleProps(
          themeProps('avatar-group-overflow', { shape, size }),
          stylex.props(
            reset.base,
            mediaSizes[size],
            avatarSizes[size],
            shapes[shape],
            styles.overflow,
            avatarStyles.overlay,
            itemShapes[shape],
            styles.item,
            interactive && avatarStyles.interactive,
            interactive && focusOutline.visible,
            xstyle,
          ),
          rest,
        ),
      },
    });
  },
);

export { AvatarGroupRoot, AvatarGroupOverflow };
