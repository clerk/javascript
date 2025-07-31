import type { OrganizationResource } from '@clerk/types';

import { OrganizationAvatarUploader } from '@/ui/common/organizations/OrganizationAvatarUploader';
import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';

import { descriptors } from '../../customizables';
import { localizationKeys } from '../../localization';

export const OrganizationProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { organization: Partial<OrganizationResource> },
) => {
  const { organization, ...rest } = props;

  return (
    <OrganizationAvatarUploader
      organization={organization}
      actionTitle={localizationKeys('organizationProfile.start.profileSection.uploadAction__title')}
      imageTitle={localizationKeys('userProfile.profilePage.imageFormTitle')}
      elementDescriptor={descriptors.organizationAvatarUploaderContainer}
      {...rest}
    />
  );
};
