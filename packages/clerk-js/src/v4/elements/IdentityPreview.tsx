import React from 'react';

import { Button, Flex, Icon, Text } from '../customizables';
import { PencilEdit } from '../icons';
import { PropsOfComponent } from '../styledSystem';
import { Avatar } from './Avatar';

type IdentityPreviewProps = {
  avatarUrl: string | null | undefined;
  identifier: string | null | undefined;
  onClick: React.MouseEventHandler;
} & PropsOfComponent<typeof Flex>;

export const IdentityPreview = (props: IdentityPreviewProps) => {
  const { avatarUrl, identifier, onClick, ...rest } = props;
  const refs = React.useRef({ avatarUrl, identifier });

  return (
    <Flex
      align='center'
      gap={2}
      sx={theme => ({ marginTop: theme.space.$3x5, marginLeft: theme.space.$2 })}
      {...rest}
    >
      <Avatar profileImageUrl={refs.current.avatarUrl} />
      <Text
        variant='hint'
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
  );
};
