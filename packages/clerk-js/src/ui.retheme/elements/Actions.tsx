import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Icon, Spinner, Text } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';

export const Actions = (props: PropsOfComponent<typeof Flex>) => {
  return <Col {...props} />;
};

export const SecondaryActions = (props: PropsOfComponent<typeof Flex>) => {
  return <Actions {...props} />;
};

type ActionProps = Omit<PropsOfComponent<typeof Button>, 'label'> & {
  icon: React.ComponentType;
  trailing?: React.ReactNode;
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
    trailing,
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
      size='md'
      variant='ghost'
      textVariant='buttonLarge'
      focusRing={false}
      hoverAsFocus
      // TODO: colors should be colorTextSecondary
      sx={[
        theme => ({
          flex: '1',
          borderRadius: 0,
          borderBottom: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
          gap: theme.space.$3,
          padding: `${theme.space.$4} ${theme.space.$5}`,
          justifyContent: 'flex-start',
        }),
        sx,
      ]}
      isDisabled={card.isLoading}
      onClick={onClick}
      role='menuitem'
      {...rest}
    >
      <Flex
        elementDescriptor={iconBoxElementDescriptor}
        elementId={iconBoxElementId}
        justify='center'
        sx={theme => ({ flex: `0 0 ${theme.sizes.$9}` })}
      >
        {status.isLoading ? (
          <Spinner
            size='xs'
            elementDescriptor={descriptors.spinner}
          />
        ) : (
          <Icon
            elementDescriptor={iconElementDescriptor}
            elementId={iconElementId}
            icon={icon}
            sx={[
              theme => ({
                width: theme.sizes.$4,
                height: theme.sizes.$6,
              }),
            ]}
          />
        )}
      </Flex>
      <Text
        localizationKey={label}
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
        as='span'
        variant='buttonLarge'
        colorScheme='inherit'
      />
      {trailing}
    </Button>
  );
};

export const SmallAction = (props: ActionProps) => {
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
    trailing,
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
      size='xs'
      variant='ghost'
      textVariant='buttonSmall'
      focusRing={false}
      hoverAsFocus
      // TODO: colors should be colorTextSecondary
      sx={[
        t => ({
          flex: '1 1 0',
          borderRadius: t.radii.$lg,
          padding: `${t.space.$1} ${t.space.$1x5}`,
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow:
            '0px 2px 3px -1px rgba(0, 0, 0, 0.08), 0px 1px 0px 0px rgba(25, 28, 33, 0.02), 0px 0px 0px 1px rgba(25, 28, 33, 0.08)',
        }),
        sx,
      ]}
      isDisabled={card.isLoading}
      onClick={onClick}
      role='menuitem'
      {...rest}
    >
      <Flex
        elementDescriptor={iconBoxElementDescriptor}
        elementId={iconBoxElementId}
        justify='center'
      >
        {status.isLoading ? (
          <Spinner
            size='xs'
            elementDescriptor={descriptors.spinner}
          />
        ) : (
          <Icon
            elementDescriptor={iconElementDescriptor}
            elementId={iconElementId}
            icon={icon}
            sx={theme => ({
              width: theme.sizes.$4,
              height: theme.sizes.$4,
              marginRight: theme.space.$2,
            })}
          />
        )}
      </Flex>
      <Text
        localizationKey={label}
        elementDescriptor={textElementDescriptor}
        elementId={textElementId}
        as='span'
        variant='buttonSmall'
        colorScheme='inherit'
      />
      {trailing}
    </Button>
  );
};
