import type { OrganizationResource } from '@clerk/types';

import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
import { AvatarUploader } from '@/ui/elements/AvatarUploader';
import { OrganizationAvatar } from '@/ui/elements/OrganizationAvatar';

import { Col, Text } from '../../customizables';
import type { LocalizationKey } from '../../localization';

type OrganizationAvatarUploaderProps = Omit<AvatarUploaderProps, 'avatarPreview' | 'title'> & {
  imageTitle: LocalizationKey;
  actionTitle: LocalizationKey;
  organization: Partial<OrganizationResource>;
  elementDescriptor: ElementDescriptor;
};

export const OrganizationAvatarUploader = ({
  imageTitle,
  actionTitle,
  organization,
  elementDescriptor,
  ...rest
}: OrganizationAvatarUploaderProps) => {
  return (
    <Col elementDescriptor={elementDescriptor}>
      <Text
        variant='subtitle'
        sx={t => ({
          textAlign: 'left',
          marginBottom: t.space.$2,
        })}
        localizationKey={actionTitle}
      />
      <AvatarUploader
        {...rest}
        title={imageTitle}
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
