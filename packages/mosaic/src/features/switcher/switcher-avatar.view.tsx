import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { AvatarProps } from '../../components/avatar';
import { Avatar } from '../../components/avatar';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { badgeSizes, leadSizes, ringSizes, sizes, styles } from './switcher-avatar.styles';
import { useSlot } from './switcher-surface';

function initials(name: string): string {
  const [first = '', second = ''] = name.trim().split(/\s+/);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || '?';
}

export interface RowAvatarProps {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  size: AvatarProps['size'];
  xstyle?: AvatarProps['xstyle'];
}

export function RowAvatar({ name, imageUrl, shape, size, xstyle }: RowAvatarProps): ReactElement {
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

export interface BadgedAvatarProps {
  name: string;
  imageUrl?: string;
  badge: { name: string; imageUrl?: string };
  size: 'sm' | 'md';
  focusRing?: boolean;
  labelled?: boolean;
}

export function BadgedAvatar({
  name,
  imageUrl,
  badge,
  size,
  focusRing = false,
  labelled = false,
}: BadgedAvatarProps): ReactElement {
  const slot = useSlot();
  return (
    <span
      aria-hidden
      {...mergeStyleProps(
        themeProps(slot('avatar'), { size }),
        stylex.props(reset.base, styles.root, sizes[size], labelled && styles.labelled),
      )}
    >
      <RowAvatar
        name={name}
        imageUrl={imageUrl}
        shape='square'
        size='fit'
        xstyle={[styles.lead, leadSizes[size]]}
      />
      {focusRing ? <span {...stylex.props(reset.base, styles.ring, ringSizes[size])} /> : null}
      <span {...mergeStyleProps(themeProps(slot('avatar-badge')), stylex.props(reset.base, styles.badge))}>
        <RowAvatar
          name={badge.name}
          imageUrl={badge.imageUrl}
          shape='circle'
          size='fit'
          xstyle={badgeSizes[size]}
        />
      </span>
    </span>
  );
}
