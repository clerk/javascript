import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, Col, descriptors, Flex, Icon, Spinner, useLocalizations } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import { useCardState } from '../elements/contexts';
import { useLoadingStatus } from '../hooks';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';

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
  iconBoxSx?: ThemableCssProp;
  iconElementDescriptor?: ElementDescriptor;
  iconElementId?: ElementId;
  iconSx?: ThemableCssProp;
};

export const SmallAction = (props: ActionProps) => {
  const { sx, iconBoxSx, iconSx, ...rest } = props;
  return (
    <Action
      size='xs'
      variant='secondary'
      textVariant='extraSmallMedium'
      sx={[
        t => ({
          borderRadius: t.radii.$lg,
          borderBottom: 'none',
          gap: 0,
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
          marginRight: t.space.$2,
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
        sx={[theme => ({ flex: `0 0 ${theme.sizes.$9}` }), iconBoxSx]}
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
              iconSx,
            ]}
          />
        )}
      </Flex>
      {t(label)}
      {trailing}
    </Button>
  );
};
