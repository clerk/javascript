import type { OrganizationResource } from '@clerk/shared/types';

import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
import { AvatarUploader } from '@/ui/elements/AvatarUploader';
import { OrganizationAvatar } from '@/ui/elements/OrganizationAvatar';

import { Col, descriptors, Text } from '../../customizables';
import { localizationKeys } from '../../localization';

export const OrganizationProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { organization: Partial<OrganizationResource> },
) => {
  const { organization, ...rest } = props;

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
        title={localizationKeys('userProfile.profilePage.imageFormTitle')}
        avatarPreview={
          <OrganizationAvatar
            size={theme => theme.sizes.$16}
            {...organization}
          />
        }
      />
    </Col>
  );
};
