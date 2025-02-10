import type { LocalizationKey } from '../customizables';
import { Col, descriptors } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { Card, Header, useCardState } from './index';

export type FormProps = {
  onSuccess: () => void;
  onReset: () => void;
};

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle?: LocalizationKey | string;
  headerTitleTextVariant?: PropsOfComponent<typeof Header.Title>['textVariant'];
  headerSubtitle?: LocalizationKey;
  headerSubtitleTextVariant?: PropsOfComponent<typeof Header.Subtitle>['variant'];
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
