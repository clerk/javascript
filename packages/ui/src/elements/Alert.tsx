import type { LocalizationKey } from '../customizables';
import {
  Alert as AlertCust,
  AlertIcon,
  Button,
  Col,
  descriptors,
  Icon,
  Text,
  useLocalizations,
} from '../customizables';
import { Close } from '../icons';
import type { PropsOfComponent } from '../styledSystem';

type DismissProps =
  | { onDismiss: () => void; dismissLabel: LocalizationKey | string }
  | { onDismiss?: undefined; dismissLabel?: undefined };

type _AlertProps = {
  variant?: 'danger' | 'warning' | 'info';
  title?: LocalizationKey | string;
  subtitle?: LocalizationKey | string;
} & DismissProps;

type AlertProps = Omit<PropsOfComponent<typeof AlertCust>, keyof _AlertProps> & _AlertProps;

export const Alert = (props: AlertProps): JSX.Element | null => {
  const { children, title, subtitle, variant = 'warning', onDismiss, dismissLabel, ...rest } = props;
  const { t } = useLocalizations();

  if (!children && !title && !subtitle) {
    return null;
  }

  const textColorScheme = variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'secondary';
  const dismissIconColorScheme = variant === 'info' ? 'neutral' : variant;

  return (
    <AlertCust
      elementDescriptor={descriptors.alert}
      elementId={descriptors.alert.setId(variant)}
      colorScheme={variant}
      align='start'
      gap={2}
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
        sx={{ textAlign: 'start' }}
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
      {onDismiss && (
        <Button
          variant='ghost'
          colorScheme={variant === 'danger' ? 'danger' : 'neutral'}
          aria-label={typeof dismissLabel === 'string' ? dismissLabel : dismissLabel ? t(dismissLabel) : undefined}
          onClick={onDismiss}
          sx={theme => ({
            flexShrink: 0,
            padding: theme.space.$1,
            marginInlineStart: 'auto',
            marginBlockStart: `calc(-1 * ${theme.space.$1})`,
          })}
        >
          <Icon
            icon={Close}
            size='md'
            colorScheme={dismissIconColorScheme}
          />
        </Button>
      )}
    </AlertCust>
  );
};
