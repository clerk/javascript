import { UserResource } from '@clerk/types';
import React from 'react';

import { Flex, Text } from '../customizables';
import { Avatar } from '../elements';
import { PropsOfComponent } from '../styledSystem';
import { getFullName } from '../utils';
import { getIdentifier } from './getIdentifier';

export type UserPreviewProps = PropsOfComponent<typeof Flex> & { user: UserResource; size?: 'md' | 'sm' };

export const UserPreview = (props: UserPreviewProps) => {
  const { user, size = 'md', ...rest } = props;
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
        sx={theme => ({ flex: `0 0 ${theme.sizes.$11}` })}
      >
        <Avatar
          {...user}
          // TODO: This should be coming from the theme
          size={theme => (size === 'md' ? theme.sizes.$11 : theme.sizes.$8)}
          optimize
        />
      </Flex>
      <Flex
        direction='col'
        justify='center'
        sx={{ textAlign: 'left' }}
      >
        <Text
          variant={size === 'md' ? 'secondaryHeading' : 'label'}
          truncate
        >
          {name || identifier}
        </Text>
        {name && identifier && (
          <Text
            variant='secondarySubheading'
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
