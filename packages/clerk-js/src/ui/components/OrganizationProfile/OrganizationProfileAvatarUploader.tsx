import type { OrganizationResource } from '@clerk/types';

import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
import { AvatarUploader } from '@/ui/elements/AvatarUploader';
import { OrganizationAvatar } from '@/ui/elements/OrganizationAvatar';

import { Col, descriptors, Text } from '../../customizables';
import { localizationKeys } from '../../localization';

export const OrganizationProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { organization: Partial<OrganizationResource> },
) => {
  const { organization, imageRemoved, previewImageUrl, ...rest } = props;

  // Determine which image URL to show
  const imageUrl = imageRemoved ? undefined : previewImageUrl || organization.imageUrl;

  return (
    <Col elementDescriptor={descriptors.organizationAvatarUploaderContainer}>
      <Text
        variant='subtitle'
        sx={t => ({
          textAlign: 'left',
          marginBottom: t.space.$2,
        })}
        localizationKey={localizationKeys('organizationProfile.start.profileSection.uploadAction__title')}
      />
      <AvatarUploader
        {...rest}
        imageRemoved={imageRemoved}
        previewImageUrl={previewImageUrl}
        title={localizationKeys('userProfile.profilePage.imageFormTitle')}
        avatarPreview={
          <OrganizationAvatar
            size={theme => theme.sizes.$16}
            {...organization}
            imageUrl={imageUrl}
          />
        }
      />
    </Col>
  );
};
