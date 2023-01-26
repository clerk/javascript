import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Alert as AlertCust, AlertIcon, Col, descriptors, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { animations } from '../styledSystem';

type _AlertProps = {
  variant?: 'danger' | 'warning';
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
};

type AlertProps = Omit<PropsOfComponent<typeof AlertCust>, keyof _AlertProps> & _AlertProps;

export const Alert = (props: AlertProps): JSX.Element | null => {
  const { children, title, subtitle, variant = 'warning', ...rest } = props;

  if (!children && (!title || !subtitle)) {
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
      <Col
        elementDescriptor={descriptors.alertTextContainer}
        elementId={descriptors.alertTextContainer.setId(variant)}
        gap={1}
      >
        <Text
          elementDescriptor={descriptors.alertText}
          elementId={descriptors.alert.setId(variant)}
          colorScheme='neutral'
          variant='smallRegular'
          localizationKey={title}
        >
          {children}
        </Text>
        {subtitle && (
          <Text
            elementDescriptor={descriptors.alertText}
            elementId={descriptors.alert.setId(variant)}
            colorScheme='neutral'
            variant='smallRegular'
            localizationKey={subtitle}
          />
        )}
      </Col>
    </AlertCust>
  );
};

export const CardAlert = React.memo((props: AlertProps) => {
  return (
    <Alert
      variant='danger'
      sx={theme => ({
        willChange: 'transform, opacity, height',
        animation: `${animations.textInBig} ${theme.transitionDuration.$slow}`,
      })}
      {...props}
    />
  );
});
