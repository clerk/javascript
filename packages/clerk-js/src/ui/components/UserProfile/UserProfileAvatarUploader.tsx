import type { UserResource } from '@clerk/types';

import type { AvatarUploaderProps } from '../../elements';
import { AvatarUploader, UserAvatar } from '../../elements';
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
