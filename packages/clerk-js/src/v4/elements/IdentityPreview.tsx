import React from 'react';

import { Button, Flex, Icon, Text } from '../customizables';
import { PencilEdit } from '../icons';
import { PropsOfComponent } from '../styledSystem';
import { formatSafeIdentifier } from '../utils';
import { Avatar } from './Avatar';

type IdentityPreviewProps = {
  avatarUrl: string | null | undefined;
  identifier: string | null | undefined;
  onClick: React.MouseEventHandler;
} & PropsOfComponent<typeof Flex>;

export const IdentityPreview = (props: IdentityPreviewProps) => {
  const { avatarUrl, identifier, onClick, ...rest } = props;
  const refs = React.useRef({ avatarUrl, identifier: formatSafeIdentifier(identifier) });

  return (
    <Flex>
      <Flex
        align='center'
        gap={2}
        sx={theme => ({
          maxWidth: '100%',
          backgroundColor: theme.colors.$blackAlpha20,
          padding: `${theme.space.$1x5} ${theme.space.$4}`,
          borderRadius: theme.radii.$2xl,
          border: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
        })}
        {...rest}
      >
        <Avatar
          profileImageUrl={refs.current.avatarUrl}
          size={theme => theme.sizes.$5}
        />
        <Text
          variant='smallRegular'
          colorScheme='neutral'
          truncate
        >
          {refs.current.identifier}
        </Text>
        <Button
          variant='ghostIcon'
          onClick={onClick}
        >
          <Icon icon={PencilEdit} />
        </Button>
      </Flex>
    </Flex>
  );
};
