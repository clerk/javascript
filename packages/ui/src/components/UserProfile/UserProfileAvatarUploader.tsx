import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
import { AvatarUploader } from '@/ui/elements/AvatarUploader';
import { UserAvatar } from '@/ui/elements/UserAvatar';

import { localizationKeys } from '../../localization';
import type { ProfileAvatarData } from './profile-form.types';

export const UserProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { user: Partial<ProfileAvatarData> },
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
