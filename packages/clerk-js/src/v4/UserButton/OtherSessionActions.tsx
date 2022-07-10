import React from 'react';

import { Button, Flex, Text } from '../customizables';
import { UserPreview, UserPreviewProps } from '../elements';
import { useCardState } from '../elements/contexts';
import { mqu, PropsOfComponent } from '../styledSystem';
import { Actions } from './CurrentAccountActions';

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
        theme => ({
          height: theme.sizes.$14,
          borderRadius: 0,
          justifyContent: 'space-between',
          padding: `${theme.space.$3} ${theme.space.$6}`,
        }),
        rest.sx,
      ]}
    >
      <UserPreview
        user={user}
        size='sm'
      />
      <Text
        variant='smallRegular'
        sx={t => ({
          [mqu.xs]: {
            display: 'none',
          },
          color: t.colors.$blackAlpha500,
        })}
      >
        Switch account
      </Text>
    </Button>
  );
};
