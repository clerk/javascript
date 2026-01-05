import type { LocalizationKey } from '../customizables';
import { Alert as AlertCust, AlertIcon, Col, descriptors, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

type _AlertProps = {
  variant?: 'danger' | 'warning' | 'info';
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
};

type AlertProps = Omit<PropsOfComponent<typeof AlertCust>, keyof _AlertProps> & _AlertProps;

export const Alert = (props: AlertProps): JSX.Element | null => {
  const { children, title, subtitle, variant = 'warning', ...rest } = props;

  if (!children && !title && !subtitle) {
    return null;
  }

  const textColorScheme = variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'secondary';

  return (
    <AlertCust
      elementDescriptor={descriptors.alert}
      elementId={descriptors.alert.setId(variant)}
      colorScheme={variant}
      align='start'
      {...rest}
      sx={[rest.sx]}
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
        sx={{ textAlign: 'left' }}
      >
        <Text
          elementDescriptor={descriptors.alertText}
          elementId={descriptors.alert.setId(variant)}
          colorScheme={textColorScheme}
          variant={subtitle ? 'h3' : 'body'}
          localizationKey={title}
        >
          {children}
        </Text>
        {subtitle && (
          <Text
            elementDescriptor={descriptors.alertText}
            elementId={descriptors.alert.setId(variant)}
            colorScheme={textColorScheme}
            variant='body'
            localizationKey={subtitle}
          />
        )}
      </Col>
    </AlertCust>
  );
};
