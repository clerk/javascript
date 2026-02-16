import type { LocalizationKey } from '../customizables';
import { Col, descriptors } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { Card } from './Card';
import { useCardState } from './contexts';
import { Header } from './Header';

export type FormProps = {
  onSuccess: () => void;
  onReset: () => void;
};

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle?: LocalizationKey | string;
  headerTitleTextVariant?: PropsOfComponent<typeof Header.Title>['textVariant'];
  headerSubtitle?: LocalizationKey;
  headerSubtitleTextVariant?: PropsOfComponent<typeof Header.Subtitle>['variant'];
  badgeText?: LocalizationKey;
};

export const FormContainer = (props: PageProps) => {
  const {
    headerTitle,
    headerTitleTextVariant = 'h3',
    headerSubtitle,
    headerSubtitleTextVariant = 'body',
    badgeText,
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
        <Header.Root badgeText={badgeText}>
          {headerTitle && (
            <Header.Title
              textVariant={headerTitleTextVariant}
              {...(typeof headerTitle === 'string' ? { children: headerTitle } : { localizationKey: headerTitle })}
            />
          )}
          {headerSubtitle && (
            <Header.Subtitle
              variant={headerSubtitleTextVariant}
              {...(typeof headerSubtitle === 'string'
                ? { children: headerSubtitle }
                : { localizationKey: headerSubtitle })}
            />
          )}
        </Header.Root>
      )}
      <Card.Alert>{card.error}</Card.Alert>
      <Col gap={8}>{children}</Col>
    </Col>
  );
};
