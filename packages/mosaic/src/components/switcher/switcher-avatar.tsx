'use client';

import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { initials } from '../../utils/initials';
import type { AvatarProps } from '../avatar';
import { Avatar } from '../avatar';
import { useSlot } from './switcher.context';
import { sizes, styles } from './switcher-avatar.styles';

export interface SwitcherAvatarProps {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  size: AvatarProps['size'];
  xstyle?: AvatarProps['xstyle'];
}

export function RowAvatar({ name, imageUrl, shape, size, xstyle }: SwitcherAvatarProps): ReactElement {
  return (
    // Decorative: the same name is always in text alongside. Held at the root so the whole mark
    // stays out of the accessible name however the image resolves.
    <Avatar.Root
      aria-hidden
      size={size}
      shape={shape}
      xstyle={xstyle}
    >
      {imageUrl ? (
        <Avatar.Image
          src={imageUrl}
          alt=''
        />
      ) : null}
      <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
    </Avatar.Root>
  );
}

export interface SwitcherBadgedAvatarProps {
  name: string;
  imageUrl?: string;
  badge: { name: string; imageUrl?: string };
  size: 'sm' | 'md';
}

export function BadgedAvatar({ name, imageUrl, badge, size }: SwitcherBadgedAvatarProps): ReactElement {
  const slot = useSlot();
  return (
    <span
      aria-hidden
      {...mergeStyleProps(themeProps(slot('avatar')), stylex.props(reset.base, styles.root, sizes[size]))}
    >
      <RowAvatar
        name={name}
        imageUrl={imageUrl}
        shape='square'
        size='fit'
        xstyle={styles.lead}
      />
      <span {...mergeStyleProps(themeProps(slot('avatar-badge')), stylex.props(reset.base, styles.badge))}>
        <RowAvatar
          name={badge.name}
          imageUrl={badge.imageUrl}
          shape='circle'
          size='fit'
          xstyle={styles.badgeAvatar}
        />
      </span>
    </span>
  );
}
