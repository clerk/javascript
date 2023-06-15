import type { OrganizationPreviewId, OrganizationResource, UserResource } from '@clerk/types';
import React from 'react';

import { descriptors, Flex, Text } from '../customizables';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { roleLocalizationKey } from '../utils';
import { OrganizationAvatar } from './OrganizationAvatar';

export type OrganizationPreviewProps = Omit<PropsOfComponent<typeof Flex>, 'elementId'> & {
  organization: OrganizationResource;
  user?: UserResource;
  size?: 'lg' | 'md' | 'sm';
  avatarSx?: ThemableCssProp;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  rounded?: boolean;
  elementId?: OrganizationPreviewId;
};

export const OrganizationPreview = (props: OrganizationPreviewProps) => {
  const { organization, size = 'md', icon, rounded = false, badge, sx, user, avatarSx, elementId, ...rest } = props;
  const role = user?.organizationMemberships.find(membership => membership.organization.id === organization.id)?.role;

  return (
    <Flex
      elementDescriptor={descriptors.organizationPreview}
      elementId={descriptors.organizationPreview.setId(elementId)}
      gap={4}
      align='center'
      sx={[{ minWidth: '0px', width: '100%' }, sx]}
      {...rest}
    >
      <Flex
        elementDescriptor={descriptors.organizationPreviewAvatarContainer}
        elementId={descriptors.organizationPreviewAvatarContainer.setId(elementId)}
        justify='center'
        sx={{ position: 'relative' }}
      >
        <OrganizationAvatar
          boxElementDescriptor={descriptors.organizationPreviewAvatarBox}
          imageElementDescriptor={descriptors.organizationPreviewAvatarImage}
          {...organization}
          size={t => ({ sm: t.sizes.$8, md: t.sizes.$11, lg: t.sizes.$12x5 }[size])}
          sx={avatarSx}
          rounded={rounded}
        />
        {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
      </Flex>
      <Flex
        elementDescriptor={descriptors.organizationPreviewTextContainer}
        elementId={descriptors.organizationPreviewTextContainer.setId(elementId)}
        direction='col'
        justify='center'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          elementDescriptor={descriptors.organizationPreviewMainIdentifier}
          elementId={descriptors.organizationPreviewMainIdentifier.setId(elementId)}
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          colorScheme='inherit'
          truncate
        >
          {organization.name} {badge}
        </Text>
        {organization.name && (
          <Text
            elementDescriptor={descriptors.organizationPreviewSecondaryIdentifier}
            elementId={descriptors.organizationPreviewSecondaryIdentifier.setId(elementId)}
            localizationKey={role && roleLocalizationKey(role)}
            variant='smallRegular'
            colorScheme='neutral'
            truncate
          />
        )}
      </Flex>
    </Flex>
  );
};
