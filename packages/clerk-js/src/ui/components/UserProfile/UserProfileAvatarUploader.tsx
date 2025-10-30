import type { UserResource } from '@clerk/shared/types';

import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
import { AvatarUploader } from '@/ui/elements/AvatarUploader';
import { UserAvatar } from '@/ui/elements/UserAvatar';

import { localizationKeys } from '../../localization';

export const UserProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { user: Partial<UserResource> },
) => {
  const { user, ...rest } = props;
  return (
    <AvatarUploader
      {...rest}
      title={localizationKeys('userProfile.profilePage.imageFormTitle')}
      avatarPreview={
        <UserAvatar
          size={theme => theme.sizes.$12}
          {...user}
        />
      }
    />
  );
};
