import { OrganizationResource } from '@clerk/types';

import { AvatarUploader, AvatarUploaderProps, OrganizationAvatar } from '../../elements';
import { localizationKeys } from '../../localization';

export const OrganizationProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { organization: Partial<OrganizationResource> },
) => {
  const { organization, ...rest } = props;

  return (
    <AvatarUploader
      {...rest}
      title={localizationKeys('userProfile.profilePage.imageFormTitle')}
      avatarPreview={
        <OrganizationAvatar
          size={theme => theme.sizes.$11}
          optimize
          {...organization}
        />
      }
    />
  );
};
