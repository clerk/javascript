import type { OrganizationResource } from '@clerk/types';

import { Text } from '../../customizables';
import type { AvatarUploaderProps } from '../../elements';
import { AvatarUploader, OrganizationAvatar } from '../../elements';
import { localizationKeys } from '../../localization';

export const OrganizationProfileAvatarUploader = (
  props: Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & { organization: Partial<OrganizationResource> },
) => {
  const { organization, ...rest } = props;

  return (
    <>
      <Text
        variant='subtitle'
        sx={t => ({
          textAlign: 'left',
          marginBottom: t.space.$2,
          color: t.colors.$blackAlpha700,
        })}
        localizationKey={localizationKeys('organizationProfile.general.profileSection.uploadAction__title')}
      />
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
    </>
  );
};
