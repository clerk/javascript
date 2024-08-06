import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Icon, SimpleButton, Spinner, useLocalizations } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';

export const Actions = (props: PropsOfComponent<typeof Flex>) => {
  const { sx, ...rest } = props;
  return (
    <Col
      sx={[
        t => ({
          '> button,div': { border: `0 solid ${t.colors.$neutralAlpha100}` },
          '>:not([hidden],:empty)~:not([hidden],:empty)': {
            borderTopWidth: '1px',
            borderBottomWidth: '0',
          },
        }),
        sx,
      ]}
      {...rest}
    />
  );
};

export const SmallActions = (props: PropsOfComponent<typeof Flex>) => {
  return <Col {...props} />;
};

type ActionProps = Omit<PropsOfComponent<typeof Button>, 'label'> & {
  icon: React.ComponentType;
  trailing?: React.ReactNode;
  label: string | LocalizationKey;
  iconBoxElementDescriptor?: ElementDescriptor;
  iconBoxElementId?: ElementId;
  iconBoxSx?: ThemableCssProp;
  iconElementDescriptor?: ElementDescriptor;
  iconElementId?: ElementId;
  iconSx?: ThemableCssProp;
  spinnerSize?: PropsOfComponent<typeof Spinner>['size'];
};

export const ExtraSmallAction = (props: Omit<ActionProps, 'label'>) => {
  const card = useCardState();
  const status = useLoadingStatus();
  const {
    icon,
    onClick: onClickProp,
    iconElementDescriptor,
    sx,
    iconElementId,
    iconSx,
    iconBoxElementDescriptor,
    iconBoxElementId,
    iconBoxSx,
    trailing,
    spinnerSize,
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
    <SimpleButton
      size='xs'
      variant='outline'
      hoverAsFocus
      sx={[
        t => ({
          borderRadius: t.radii.$lg,
          gap: 0,
          justifyContent: 'center',
          padding: t.space.$1,
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
        as='span'
      >
        {status.isLoading ? (
          <Spinner
            size={spinnerSize || 'xs'}
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
                height: theme.sizes.$4,
              }),
              iconSx,
            ]}
          />
        )}
      </Flex>
      {trailing}
    </SimpleButton>
  );
};

export const SmallAction = (props: ActionProps) => {
  const { sx, iconBoxSx, iconSx, ...rest } = props;
  return (
    <Action
      size='xs'
      variant='outline'
      textVariant='buttonSmall'
      sx={[
        t => ({
          borderRadius: t.radii.$lg,
          gap: t.space.$0x5,
          justifyContent: 'center',
          flex: '1 1 0',
          padding: `${t.space.$1} ${t.space.$1x5}`,
        }),
        sx,
      ]}
      iconSx={[
        t => ({
          width: t.sizes.$4,
          height: t.sizes.$4,
        }),
        iconSx,
      ]}
      iconBoxSx={[{ flex: 'unset' }, iconBoxSx]}
      {...rest}
    />
  );
};

export const Action = (props: ActionProps) => {
  const card = useCardState();
  const status = useLoadingStatus();
  const { t } = useLocalizations();
  const {
    icon,
    label,
    onClick: onClickProp,
    iconElementDescriptor,
    sx,
    iconElementId,
    iconSx,
    iconBoxElementDescriptor,
    iconBoxElementId,
    iconBoxSx,
    trailing,
    spinnerSize,
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
      colorScheme='neutral'
      textVariant='buttonLarge'
      hoverAsFocus
      focusRing={false}
      sx={[
        t => ({
          flex: '1',
          borderRadius: 0,
          gap: t.space.$4,
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
        as='span'
        sx={[t => ({ flex: `0 0 ${t.sizes.$9}`, gap: t.space.$2, alignItems: 'center' }), iconBoxSx]}
      >
        {status.isLoading ? (
          <Spinner
            size={spinnerSize || 'xs'}
            elementDescriptor={descriptors.spinner}
            sx={t => ({
              marginRight: t.space.$1,
            })}
          />
        ) : (
          <Icon
            elementDescriptor={iconElementDescriptor}
            elementId={iconElementId}
            icon={icon}
            sx={[
              t => ({
                width: t.sizes.$4,
                height: 'auto',
                maxWidth: '100%',
              }),
              iconSx,
            ]}
          />
        )}
      </Flex>
      {label ? t(label) : null}
      {trailing}
    </Button>
  );
};
