import { UserResource } from '@clerk/types';
import React from 'react';

import { Flex, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { getFullName, getIdentifier } from '../utils';
import { Avatar } from './Avatar';

export type UserPreviewProps = PropsOfComponent<typeof Flex> & {
  user: UserResource;
  size?: 'lg' | 'md' | 'sm';
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  profileImageUrl?: string | null;
};

export const UserPreview = (props: UserPreviewProps) => {
  const { user, size = 'md', icon, profileImageUrl, badge, ...rest } = props;
  const name = getFullName(user);
  const identifier = getIdentifier(user);

  return (
    <Flex
      gap={4}
      align='center'
      {...rest}
    >
      <Flex
        justify='center'
        sx={theme => ({ position: 'relative', flex: `0 0 ${theme.sizes.$11}` })}
      >
        <Avatar
          {...user}
          {...(profileImageUrl !== undefined && { profileImageUrl })}
          size={theme => ({ sm: theme.sizes.$8, md: theme.sizes.$11, lg: theme.sizes.$12x5 }[size])}
          optimize
        />
        {icon && <Flex sx={{ position: 'absolute', left: 0, bottom: 0 }}>{icon}</Flex>}
      </Flex>
      <Flex
        direction='col'
        justify='center'
        sx={{ textAlign: 'left' }}
      >
        <Text
          variant={size === 'md' ? 'regularMedium' : 'smallMedium'}
          truncate
        >
          {name || identifier} {badge}
        </Text>
        {name && identifier && (
          <Text
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
