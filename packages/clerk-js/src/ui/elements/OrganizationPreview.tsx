import { OrganizationResource, UserResource } from '@clerk/types';
import React from 'react';

import { Flex, localizationKeys, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { OrganizationAvatar } from './OrganizationAvatar';

export type OrganizationPreviewProps = PropsOfComponent<typeof Flex> & {
  organization: OrganizationResource;
  user?: UserResource;
  size?: 'lg' | 'md' | 'sm';
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  rounded?: boolean;
  elementId?: any;
};

export const OrganizationPreview = (props: OrganizationPreviewProps) => {
  const { organization, size = 'md', icon, rounded = false, badge, sx, user, ...rest } = props;
  const role = user?.organizationMemberships.find(membership => membership.organization.id === organization.id)?.role;

  return (
    <Flex
      gap={3}
      align='center'
      sx={[{ minWidth: '0px', width: '100%' }, sx]}
      {...rest}
    >
      <Flex
        justify='center'
        sx={{ position: 'relative' }}
      >
        <OrganizationAvatar
          {...organization}
          size={t => ({ sm: t.sizes.$8, md: t.sizes.$11, lg: t.sizes.$12x5 }[size])}
          optimize
          rounded={rounded}
        />
        {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
      </Flex>
      <Flex
        direction='col'
        justify='center'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          truncate
        >
          {organization.name} {badge}
        </Text>
        {organization.name && (
          <Text
            localizationKey={
              role &&
              {
                admin: localizationKeys('membershipRole__admin'),
                basic_member: localizationKeys('membershipRole__basicMember'),
                guest_member: localizationKeys('membershipRole__guestMember'),
              }[role]
            }
            variant='smallRegular'
            colorScheme='neutral'
            truncate
          />
        )}
      </Flex>
    </Flex>
  );
};
