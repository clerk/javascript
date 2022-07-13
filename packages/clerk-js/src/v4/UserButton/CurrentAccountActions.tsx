import React from 'react';

import { Button, Col, Flex, Icon, Spinner, Text } from '../customizables';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import { PropsOfComponent } from '../styledSystem';

export const Actions = (props: PropsOfComponent<typeof Flex>) => {
  return <Col {...props} />;
};

type ActionProps = PropsOfComponent<typeof Button> & {
  icon: React.ComponentType;
  label: string;
};

export const Action = (props: ActionProps) => {
  const card = useCardState();
  const status = useLoadingStatus();
  const { icon, label, onClick: onClickProp, ...rest } = props;

  const onClick: React.MouseEventHandler<HTMLButtonElement> = async e => {
    card.setLoading();
    status.setLoading();
    try {
      await onClickProp?.(e);
    } finally {
      card.setIdle();
      status.setIdle();
    }
  };

  return (
    <Button
      variant='ghost'
      colorScheme='neutral'
      textVariant='smallRegular'
      focusRing={false}
      // TODO: colors should be colorTextSecondary
      sx={theme => ({
        flex: '1',
        borderRadius: 0,
        gap: theme.space.$4,
        padding: `${theme.space.$3x5} ${theme.space.$6}`,
        justifyContent: 'flex-start',
      })}
      isDisabled={card.isLoading}
      onClick={onClick}
      {...rest}
    >
      <Flex
        justify='center'
        sx={theme => ({ flex: `0 0 ${theme.sizes.$11}` })}
      >
        {status.isLoading ? (
          <Spinner size='sm' />
        ) : (
          <Icon
            icon={icon}
            sx={theme => ({
              color: theme.colors.$blackAlpha400,
              width: theme.sizes.$3,
              height: theme.sizes.$3,
            })}
          />
        )}
      </Flex>
      <Text
        as='span'
        variant='smallRegular'
        colorScheme='neutral'
      >
        {label}
      </Text>
    </Button>
  );
};
