import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { Flex, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { OrganizationAvatar } from './OrganizationAvatar';

export type OrganizationPreviewProps = PropsOfComponent<typeof Flex> & {
  organization: OrganizationResource;
  size?: 'lg' | 'md' | 'sm';
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  rounded?: boolean;
  elementId?: any;
};

export const OrganizationPreview = (props: OrganizationPreviewProps) => {
  const { organization, size = 'md', icon, rounded = false, badge, sx, ...rest } = props;
  const name = organization.name;
  //Mocks
  const role = 'Member';

  return (
    <Flex
      // elementDescriptor={descriptors.organizationPreview}
      // elementId={descriptors.organizationPreview.setId(elementId)}
      gap={4}
      align='center'
      sx={[
        {
          minWidth: '0px',
          width: '100%',
        },
        sx,
      ]}
      {...rest}
    >
      <Flex
        // elementDescriptor={descriptors.organizationPreviewAvatarContainer}
        // elementId={descriptors.userPreviewAvatarContainer.setId(elementId)}
        justify='center'
        sx={theme => ({ position: 'relative', flex: `0 0 ${theme.sizes.$11}` })}
      >
        <OrganizationAvatar
          // boxElementDescriptor={descriptors.organizationPreviewAvatarBox}
          // imageElementDescriptor={descriptors.organizationPreviewAvatarImage}
          {...organization}
          size={theme => ({ sm: theme.sizes.$8, md: theme.sizes.$11, lg: theme.sizes.$12x5 }[size])}
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
          {name} {badge}
        </Text>
        {name && (
          <Text
            // elementDescriptor={descriptors.organizationPreviewSecondaryIdentifier}
            //   elementId={descriptors.organizationPreviewSecondaryIdentifier.setId(elementId)}
            variant='smallRegular'
            colorScheme='neutral'
            truncate
          >
            {role}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
