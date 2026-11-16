import type { ReactElement } from 'react';

import type { AvatarProps } from '../../components/avatar';
import { Avatar } from '../../components/avatar';
import { themeProps } from '../../props';
import type { UserAvatarData } from './user-avatar.types';

export interface UserAvatarAppearanceProps {
  /**
   * The outline of the avatar.
   *
   * @default 'circle'
   */
  shape?: AvatarProps['shape'];
  /**
   * The size of the avatar. `fit` fills the element it sits in.
   *
   * @default 'sm'
   */
  size?: AvatarProps['size'];
}

export interface UserAvatarViewProps extends UserAvatarData, UserAvatarAppearanceProps {}

export function UserAvatarView({
  name,
  initials,
  imageUrl,
  shape = 'circle',
  size = 'sm',
}: UserAvatarViewProps): ReactElement {
  return (
    <Avatar.Root
      {...themeProps('user-avatar')}
      role='img'
      aria-label={name}
      shape={shape}
      size={size}
    >
      {imageUrl ? (
        <Avatar.Image
          src={imageUrl}
          alt=''
        />
      ) : null}
      <Avatar.Fallback>{initials}</Avatar.Fallback>
    </Avatar.Root>
  );
}
