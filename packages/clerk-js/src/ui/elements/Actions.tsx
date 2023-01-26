import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, Flex, Icon, Spinner, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';

export const Actions = (props: PropsOfComponent<typeof Flex>) => {
  return <Col {...props} />;
};

export const SecondaryActions = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Actions
      sx={t => ({
        backgroundColor: t.colors.$blackAlpha20,
        border: `${t.borders.$normal} ${t.colors.$blackAlpha200}`,
        borderRight: 0,
        borderLeft: 0,
      })}
      {...props}
    />
  );
};

type ActionProps = Omit<PropsOfComponent<typeof Button>, 'label'> & {
  icon: React.ComponentType;
  label: LocalizationKey;
  iconBoxElementDescriptor?: ElementDescriptor;
  iconBoxElementId?: ElementId;
  iconElementDescriptor?: ElementDescriptor;
  iconElementId?: ElementId;
  textElementDescriptor?: ElementDescriptor;
  textElementId?: ElementId;
};

export const Action = (props: ActionProps) => {
  const card = useCardState();
  const status = useLoadingStatus();
  const {
    icon,
    label,
    onClick: onClickProp,
    iconElementDescriptor,
    sx,
    iconElementId,
    textElementDescriptor,
    textElementId,
    iconBoxElementDescriptor,
    iconBoxElementId,
    ...rest
  } = props;

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
      textVariant='buttonSmallRegular'
      focusRing={false}
      hoverAsFocus
      // TODO: colors should be colorTextSecondary
      sx={[
        theme => ({
          flex: '1',
          borderRadius: 0,
          gap: theme.space.$4,
          padding: `${theme.space.$3x5} ${theme.space.$6}`,
          justifyContent: 'flex-start',
        }),
        sx,
      ]}
      isDisabled={card.isLoading}
      onClick={onClick}
      {...rest}
    >
      <Flex
        elementDescriptor={iconBoxElementDescriptor}
        elementId={iconBoxElementId}
        justify='center'
        sx={theme => ({ flex: `0 0 ${theme.sizes.$11}` })}
      >
        {status.isLoading ? (
          <Spinner size='sm' />
        ) : (
          <Icon
            elementDescriptor={iconElementDescriptor}
            elementId={iconElementId}
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
        localizationKey={label}
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
        as='span'
        variant='smallRegular'
        colorScheme='neutral'
      />
    </Button>
  );
};
