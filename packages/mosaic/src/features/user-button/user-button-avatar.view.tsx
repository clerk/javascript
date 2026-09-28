import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { AvatarProps } from '../../components/avatar';
import { Avatar } from '../../components/avatar';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { badgeSizes, leadSizes, ringSizes, sizes, styles } from './user-button-avatar.styles';

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

export interface UserButtonAvatarProps {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  size: 'xs' | 'sm';
  badge?: { name: string; imageUrl?: string };
  focusRing?: boolean;
}

export function UserButtonAvatar({
  name,
  imageUrl,
  shape,
  size,
  badge,
  focusRing = false,
}: UserButtonAvatarProps): ReactElement {
  if (!badge) {
    return (
      <RowAvatar
        name={name}
        imageUrl={imageUrl}
        shape={shape}
        size={size}
      />
    );
  }

  return (
    <span
      aria-hidden
      {...mergeStyleProps(
        themeProps('user-button-avatar', { size }),
        stylex.props(reset.base, styles.root, sizes[size]),
      )}
    >
      <RowAvatar
        name={name}
        imageUrl={imageUrl}
        shape={shape}
        size='fit'
        xstyle={[styles.lead, leadSizes[size]]}
      />
      {focusRing ? <span {...stylex.props(reset.base, styles.ring, ringSizes[size])} /> : null}
      <span {...mergeStyleProps(themeProps('user-button-avatar-badge'), stylex.props(reset.base, styles.badge))}>
        <RowAvatar
          name={badge.name}
          imageUrl={badge.imageUrl}
          shape='square'
          size='fit'
          xstyle={badgeSizes[size]}
        />
      </span>
    </span>
  );
}
