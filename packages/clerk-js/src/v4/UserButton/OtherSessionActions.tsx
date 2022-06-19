import React from 'react';

import { Button, Flex, Text } from '../customizables';
import { useCardState } from '../elements/contexts';
import { PropsOfComponent } from '../styledSystem';
import { Actions } from './CurrentAccountActions';
import { UserPreview, UserPreviewProps } from './UserPreview';

export const SessionActions = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Actions
      sx={theme => ({
        backgroundColor: theme.colors.$blackAlpha20,
        border: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
        borderRight: 0,
        borderLeft: 0,
      })}
      {...props}
    />
  );
};

type UserPreviewButtonProps = PropsOfComponent<typeof Button> & UserPreviewProps;

export const UserPreviewButton = (props: UserPreviewButtonProps) => {
  const card = useCardState();
  const { user, ...rest } = props;
  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      focusRing={false}
      isDisabled={card.isLoading}
      {...rest}
      sx={[
        theme => ({ borderRadius: 0, justifyContent: 'space-between', padding: `${theme.space.$4} ${theme.space.$6}` }),
        rest.sx,
      ]}
    >
      <UserPreview
        user={user}
        size='sm'
      />
      <Text
        variant='secondarySubheading'
        sx={theme => ({ color: theme.colors.$blackAlpha500 })}
      >
        Switch account
      </Text>
    </Button>
  );
};
