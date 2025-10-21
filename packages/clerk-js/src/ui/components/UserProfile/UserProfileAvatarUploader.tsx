import type { UserResource } from '@clerk/types';

import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
import { AvatarUploader } from '@/ui/elements/AvatarUploader';
import { UserAvatar } from '@/ui/elements/UserAvatar';

import { localizationKeys } from '../../localization';

export const UserProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { user: Partial<UserResource> },
) => {
  const { user, imageRemoved, previewImageUrl, ...rest } = props;

  // Determine which image URL to show
  const imageUrl = imageRemoved ? undefined : previewImageUrl || user.imageUrl;

  return (
    <AvatarUploader
      {...rest}
      imageRemoved={imageRemoved}
      previewImageUrl={previewImageUrl}
      title={localizationKeys('userProfile.profilePage.imageFormTitle')}
      avatarPreview={
        <UserAvatar
          size={theme => theme.sizes.$12}
          {...user}
          imageUrl={imageUrl}
        />
      }
    />
  );
};
