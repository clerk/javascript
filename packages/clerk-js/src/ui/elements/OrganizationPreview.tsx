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

  return (
    <Flex
      // elementDescriptor={descriptors.userPreview}
      // elementId={descriptors.userPreview.setId(elementId)}
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
        // elementDescriptor={descriptors.userPreviewAvatarContainer}
        // elementId={descriptors.userPreviewAvatarContainer.setId(elementId)}
        justify='center'
        sx={theme => ({ position: 'relative', flex: `0 0 ${theme.sizes.$11}` })}
      >
        <OrganizationAvatar
          // boxElementDescriptor={descriptors.userPreviewAvatarBox}
          // imageElementDescriptor={descriptors.userPreviewAvatarImage}
          {...organization}
          size={theme => ({ sm: theme.sizes.$8, md: theme.sizes.$11, lg: theme.sizes.$12x5 }[size])}
          optimize
          rounded={rounded}
        />
        {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
      </Flex>
      <Flex
        // elementDescriptor={descriptors.userPreviewTextContainer}
        // elementId={descriptors.userPreviewTextContainer.setId(elementId)}
        direction='col'
        justify='center'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          // elementDescriptor={descriptors.userPreviewMainIdentifier}
          // elementId={descriptors.userPreviewMainIdentifier.setId(elementId)}
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          truncate
        >
          {name} {badge}
        </Text>
        {name && (
          <Text
            // elementDescriptor={descriptors.userPreviewSecondaryIdentifier}
            //   elementId={descriptors.userPreviewSecondaryIdentifier.setId(elementId)}
            variant='smallRegular'
            colorScheme='neutral'
            truncate
          >
            {/* TODO: Add org role for user */}
            Member
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
