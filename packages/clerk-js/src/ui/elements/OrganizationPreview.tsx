import type { OrganizationPreviewId, UserOrganizationInvitationResource, UserResource } from '@clerk/types';
import React from 'react';

import { descriptors, Flex, Text } from '../customizables';
import { useFetchRoles, useLocalizeCustomRoles } from '../hooks/useFetchRoles';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { OrganizationAvatar } from './OrganizationAvatar';

export type OrganizationPreviewProps = Omit<PropsOfComponent<typeof Flex>, 'elementId'> & {
  organization: UserOrganizationInvitationResource['publicOrganizationData'];
  user?: UserResource;
  size?: 'lg' | 'md' | 'sm' | 'xs';
  avatarSx?: ThemableCssProp;
  mainIdentifierSx?: ThemableCssProp;
  mainIdentifierVariant?: PropsOfComponent<typeof Text>['variant'];
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  rounded?: boolean;
  elementId?: OrganizationPreviewId;
  fetchRoles?: boolean;
};

export const OrganizationPreview = (props: OrganizationPreviewProps) => {
  const {
    organization,
    size = 'md',
    icon,
    rounded = false,
    fetchRoles = false,
    badge,
    sx,
    user,
    avatarSx,
    mainIdentifierSx,
    mainIdentifierVariant,
    elementId,
    ...rest
  } = props;

  const { localizeCustomRole } = useLocalizeCustomRoles();
  const { options } = useFetchRoles(fetchRoles);

  const membership = user?.organizationMemberships.find(membership => membership.organization.id === organization.id);
  const unlocalizedRoleLabel = options?.find(a => a.value === membership?.role)?.label;
  const roleLabel = localizeCustomRole(membership?.role) || unlocalizedRoleLabel;

  const mainTextSize =
    mainIdentifierVariant || ({ xs: 'subtitle', sm: 'caption', md: 'subtitle', lg: 'h1' } as const)[size];

  return (
    <Flex
      elementDescriptor={descriptors.organizationPreview}
      elementId={descriptors.organizationPreview.setId(elementId)}
      gap={3}
      align='center'
      as='span'
      sx={[{ minWidth: '0' }, sx]}
      {...rest}
    >
      <Flex
        elementDescriptor={descriptors.organizationPreviewAvatarContainer}
        elementId={descriptors.organizationPreviewAvatarContainer.setId(elementId)}
        justify='center'
        as='span'
        sx={{ position: 'relative' }}
      >
        <OrganizationAvatar
          boxElementDescriptor={descriptors.organizationPreviewAvatarBox}
          imageElementDescriptor={descriptors.organizationPreviewAvatarImage}
          {...organization}
          size={t => ({ xs: t.sizes.$5, sm: t.sizes.$8, md: t.sizes.$9, lg: t.sizes.$12 }[size])}
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
        as='span'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          elementDescriptor={descriptors.organizationPreviewMainIdentifier}
          elementId={descriptors.organizationPreviewMainIdentifier.setId(elementId)}
          variant={mainTextSize}
          as='span'
          truncate
          sx={mainIdentifierSx}
        >
          {organization.name} {badge}
        </Text>

        {roleLabel && (
          <Text
            elementDescriptor={descriptors.organizationPreviewSecondaryIdentifier}
            elementId={descriptors.organizationPreviewSecondaryIdentifier.setId(elementId)}
            as='span'
            localizationKey={roleLabel}
            truncate
          />
        )}
      </Flex>
    </Flex>
  );
};
