import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Icon } from '../customizables';
import { Close as CloseIcon } from '../icons';
import type { PropsOfComponent } from '../styledSystem';
import { Card, Header, IconButton, useCardState } from './index';

export type FormProps = {
  onSuccess: () => void;
  onReset: () => void;
};

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle?: LocalizationKey | string;
  headerTitleTextVariant?: PropsOfComponent<typeof Header.Title>['textVariant'];
  headerSubtitle?: LocalizationKey;
  headerSubtitleTextVariant?: PropsOfComponent<typeof Header.Subtitle>['variant'];
  onReset?: () => void;
};

export const FormContainer = (props: PageProps) => {
  const {
    headerTitle,
    headerTitleTextVariant = 'h3',
    headerSubtitle,
    headerSubtitleTextVariant = 'body',
    children,
    sx,
    ...rest
  } = props;
  const card = useCardState();

  return (
    <Col
      elementDescriptor={descriptors.formContainer}
      gap={4}
      {...rest}
      sx={[sx]}
    >
      <IconButton
        elementDescriptor={descriptors.drawerClose}
        variant='ghost'
        aria-label='Close drawer'
        onClick={() => rest.onReset?.()}
        icon={
          <Icon
            icon={CloseIcon}
            size='sm'
          />
        }
        sx={t => ({
          flexShrink: 0,
          position: 'absolute',
          top: t.space.$3,
          right: t.space.$3,
        })}
      />
      {(headerTitle || headerSubtitle) && (
        <Header.Root>
          {headerTitle && (
            <Header.Title
              localizationKey={headerTitle}
              textVariant={headerTitleTextVariant}
            />
          )}
          {headerSubtitle && (
            <Header.Subtitle
              localizationKey={headerSubtitle}
              variant={headerSubtitleTextVariant}
            />
          )}
        </Header.Root>
      )}
      <Card.Alert>{card.error}</Card.Alert>
      <Col gap={8}>{children}</Col>
    </Col>
  );
};
