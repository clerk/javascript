import { UserResource } from '@clerk/types';

import { AvatarUploader, AvatarUploaderProps, UserAvatar } from '../../elements';
import { localizationKeys } from '../../localization';

export const UserProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { user: Partial<UserResource> },
) => {
  const { user, ...rest } = props;
  return (
    <AvatarUploader
      {...rest}
      title={localizationKeys('userProfile.profilePage.imageFormTitle')}
      hasImageUrl={!(user.profileImageUrl || '').includes('gravatar')}
      avatarPreview={
        <UserAvatar
          size={theme => theme.sizes.$11}
          optimize
          {...user}
        />
      }
    />
  );
};
