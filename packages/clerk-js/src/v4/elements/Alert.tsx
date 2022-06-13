import React from 'react';

import { Alert as AlertCust, AlertIcon, descriptors, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

type AlertProps = React.PropsWithChildren<{
  variant?: 'danger' | 'warning';
}> &
  PropsOfComponent<typeof AlertCust>;

export const Alert = (props: AlertProps): JSX.Element | null => {
  const { children, variant = 'warning', ...rest } = props;

  if (!children) {
    return null;
  }

  return (
    <AlertCust
      elementDescriptor={descriptors.alert}
      elementId={descriptors.alert.setId(variant)}
      {...rest}
    >
      <AlertIcon
        elementId={descriptors.alert.setId(variant)}
        elementDescriptor={descriptors.alertIcon}
        variant={variant}
        colorScheme={variant}
        sx={{ flexShrink: '0' }}
      />
      <Text
        elementDescriptor={descriptors.alertText}
        elementId={descriptors.alert.setId(variant)}
        colorScheme='neutral'
        // TODO: should these variants also include a size?
        variant='hint'
      >
        {children}
      </Text>
    </AlertCust>
  );
};

export const CardAlert = React.memo((props: AlertProps) => {
  return (
    <Alert
      variant='danger'
      sx={theme => ({ marginBottom: theme.space.$8 })}
      {...props}
    />
  );
});
