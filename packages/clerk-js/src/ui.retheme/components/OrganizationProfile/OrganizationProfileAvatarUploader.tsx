import type { OrganizationResource } from '@clerk/types';

import type { AvatarUploaderProps } from '../../elements';
import { AvatarUploader, OrganizationAvatar } from '../../elements';
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
          size={theme => theme.sizes.$12}
          {...organization}
        />
      }
    />
  );
};
