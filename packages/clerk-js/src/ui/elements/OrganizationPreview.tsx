import { OrganizationResource, UserResource } from '@clerk/types';
import React from 'react';

import { Flex, Text } from '../customizables';
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

  return (
    <Flex
      // elementDescriptor={descriptors.organizationPreview}
      // elementId={descriptors.organizationPreview.setId(elementId)}
      gap={3}
      align='center'
      sx={[{ minWidth: '0px', width: '100%' }, sx]}
      {...rest}
    >
      <Flex
        // elementDescriptor={descriptors.organizationPreviewAvatarContainer}
        // elementId={descriptors.userPreviewAvatarContainer.setId(elementId)}
        justify='center'
        sx={{ position: 'relative' }}
      >
        <OrganizationAvatar
          // boxElementDescriptor={descriptors.organizationPreviewAvatarBox}
          // imageElementDescriptor={descriptors.organizationPreviewAvatarImage}
          {...organization}
          size={t => ({ sm: t.sizes.$8, md: t.sizes.$11, lg: t.sizes.$12x5 }[size])}
          optimize
          rounded={rounded}
        />
        {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
      </Flex>
      <Flex
        // elementDescriptor={descriptors.organizationPreviewTextContainer}
        // elementId={descriptors.organizationPreviewTextContainer.setId(elementId)}
        direction='col'
        justify='center'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          // elementDescriptor={descriptors.organizationPreviewMainIdentifier}
          // elementId={descriptors.organizationPreviewMainIdentifier.setId(elementId)}
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          truncate
        >
          {organization.name} {badge}
        </Text>
        {organization.name && (
          <Text
            // elementDescriptor={descriptors.organizationPreviewSecondaryIdentifier}
            //   elementId={descriptors.organizationPreviewSecondaryIdentifier.setId(elementId)}
            variant='smallRegular'
            colorScheme='neutral'
            truncate
          >
            {/*{role}*/}
            {user && 'Member'}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
