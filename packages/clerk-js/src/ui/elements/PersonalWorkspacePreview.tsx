import { UserResource } from '@clerk/types';
import React from 'react';

import { Flex, localizationKeys, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { getFullName, getIdentifier } from '../utils';
import { UserAvatar } from './UserAvatar';

export type PersonalWorkspacePreviewProps = PropsOfComponent<typeof Flex> & {
  user: Partial<UserResource>;
  size?: 'lg' | 'md' | 'sm';
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  imageUrl?: string | null;
  rounded?: boolean;
  elementId?: any;
};

export const PersonalWorkspacePreview = (props: PersonalWorkspacePreviewProps) => {
  const { user, size = 'md', icon, rounded = false, imageUrl, badge, elementId, sx, ...rest } = props;
  const name = getFullName(user);
  const identifier = getIdentifier(user);

  return (
    <Flex
      // elementDescriptor={descriptors.personalWorkspacePreview}
      // elementId={descriptors.personalWorkspace.setId(elementId)}
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
        // elementDescriptor={descriptors.personalWorkspaceAvatarContainer}
        // elementId={descriptors.personalWorkspacePreviewAvatarContainer.setId(elementId)}
        justify='center'
        sx={theme => ({ position: 'relative', flex: `0 0 ${theme.sizes.$11}` })}
      >
        <UserAvatar
          // boxElementDescriptor={descriptors.personalWorkspacePreviewAvatarBox}
          // imageElementDescriptor={descriptors.personalWorkspacePreviewAvatarImage}
          {...user}
          imageUrl={imageUrl || user.profileImageUrl}
          size={theme => ({ sm: theme.sizes.$8, md: theme.sizes.$11, lg: theme.sizes.$12x5 }[size])}
          optimize
          rounded={rounded}
        />
        {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
      </Flex>
      <Flex
        // elementDescriptor={descriptors.personalWorkspacePreviewTextContainer}
        // elementId={descriptors.personalWorkspacePreviewTextContainer.setId(elementId)}
        direction='col'
        justify='center'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          // elementDescriptor={descriptors.personalWorkspacePreviewMainIdentifier}
          // elementId={descriptors.personalWorkspacePreviewMainIdentifier.setId(elementId)}
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          truncate
        >
          {name || identifier} {badge}
        </Text>
        <Text
          // elementDescriptor={descriptors.personalWorkspacePreviewSecondaryIdentifier}
          // elementId={descriptors.personalWorkspacePreviewSecondaryIdentifier.setId(elementId)}
          variant='smallRegular'
          colorScheme='neutral'
          truncate
          localizationKey={localizationKeys('organizationSwitcher.personalWorkspace')}
        />
      </Flex>
    </Flex>
  );
};
