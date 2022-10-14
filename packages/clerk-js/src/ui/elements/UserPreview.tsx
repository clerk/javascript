import { UserResource } from '@clerk/types';
import React from 'react';

import { descriptors, Flex, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { getFullName, getIdentifier } from '../utils';
import { UserAvatar } from './UserAvatar';

export type UserPreviewProps = PropsOfComponent<typeof Flex> & {
  user: Partial<UserResource>;
  size?: 'lg' | 'md' | 'sm';
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  imageUrl?: string | null;
  rounded?: boolean;
  elementId?: any;
};

export const UserPreview = (props: UserPreviewProps) => {
  const { user, size = 'md', icon, rounded = true, imageUrl, badge, elementId, sx, ...rest } = props;
  const name = getFullName(user);
  const identifier = getIdentifier(user);

  return (
    <Flex
      elementDescriptor={descriptors.userPreview}
      elementId={descriptors.userPreview.setId(elementId)}
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
        elementDescriptor={descriptors.userPreviewAvatarContainer}
        elementId={descriptors.userPreviewAvatarContainer.setId(elementId)}
        justify='center'
        sx={theme => ({ position: 'relative', flex: `0 0 ${theme.sizes.$11}` })}
      >
        <UserAvatar
          boxElementDescriptor={descriptors.userPreviewAvatarBox}
          imageElementDescriptor={descriptors.userPreviewAvatarImage}
          {...user}
          imageUrl={imageUrl || user.profileImageUrl}
          size={theme => ({ sm: theme.sizes.$8, md: theme.sizes.$11, lg: theme.sizes.$12x5 }[size])}
          optimize
          rounded={rounded}
        />
        {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
      </Flex>
      <Flex
        elementDescriptor={descriptors.userPreviewTextContainer}
        elementId={descriptors.userPreviewTextContainer.setId(elementId)}
        direction='col'
        justify='center'
        sx={{ minWidth: '0px', textAlign: 'left' }}
      >
        <Text
          elementDescriptor={descriptors.userPreviewMainIdentifier}
          elementId={descriptors.userPreviewMainIdentifier.setId(elementId)}
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          truncate
        >
          {name || identifier} {badge}
        </Text>
        {name && identifier && (
          <Text
            elementDescriptor={descriptors.userPreviewSecondaryIdentifier}
            elementId={descriptors.userPreviewSecondaryIdentifier.setId(elementId)}
            variant='smallRegular'
            colorScheme='neutral'
            truncate
          >
            {identifier}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
