import type { OrganizationResource } from '@clerk/types';

import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
import { AvatarUploader } from '@/ui/elements/AvatarUploader';
import { OrganizationAvatar } from '@/ui/elements/OrganizationAvatar';

import { Col, descriptors, Text } from '../../customizables';
import { localizationKeys } from '../../localization';

export const OrganizationProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { organization: Partial<OrganizationResource> },
) => {
  const { organization, imageRemoved, previewImageUrl, avatarPreviewPlaceholder, ...rest } = props;

  // Determine which image URL to show
  // If imageRemoved is provided (deferred upload), use that logic
  // Otherwise, use immediate upload logic (include previewImageUrl)
  const imageUrl =
    imageRemoved !== undefined
      ? imageRemoved
        ? undefined
        : previewImageUrl || organization.imageUrl
      : previewImageUrl || organization.imageUrl;

  // When image is removed, ensure we have a name for initials
  const organizationWithFallback =
    imageRemoved && !organization.name ? { ...organization, name: 'Organization' } : organization;

  // For CreateOrganization: show placeholder when no image, avatar when image exists
  // For OrganizationProfile: always show avatar (deferred upload)
  const shouldShowPlaceholder = avatarPreviewPlaceholder && !imageUrl;

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
        {...(imageRemoved !== undefined && { imageRemoved })}
        {...(previewImageUrl !== undefined && { previewImageUrl })}
        {...(avatarPreviewPlaceholder && { avatarPreviewPlaceholder })}
        title={localizationKeys('userProfile.profilePage.imageFormTitle')}
        avatarPreview={
          shouldShowPlaceholder ? undefined : (
            <OrganizationAvatar
              size={theme => theme.sizes.$16}
              {...organizationWithFallback}
              imageUrl={imageUrl}
            />
          )
        }
      />
    </Col>
  );
};
