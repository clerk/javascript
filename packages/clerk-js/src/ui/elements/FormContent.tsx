import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { Card, Header, useCardState } from './index';

export type FormProps = {
  onSuccess: () => void;
  onReset?: () => void;
};

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle?: LocalizationKey | string;
  headerTitleTextVariant?: PropsOfComponent<typeof Header.Title>['textVariant'];
  breadcrumbTitle?: LocalizationKey;
  Breadcrumbs?: React.ComponentType<any> | null;
  headerSubtitle?: LocalizationKey;
  headerSubtitleTextVariant?: PropsOfComponent<typeof Header.Subtitle>['variant'];
};

export const FormContent = (props: PageProps) => {
  const {
    headerTitle,
    headerTitleTextVariant,
    headerSubtitle,
    headerSubtitleTextVariant,
    breadcrumbTitle,
    children,
    Breadcrumbs,
    sx,
    ...rest
  } = props;
  const card = useCardState();

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
      {...rest}
      sx={[sx]}
    >
      <Card.Alert>{card.error}</Card.Alert>
      <Header.Root>
        {headerTitle && (
          <Header.Title
            localizationKey={headerTitle}
            textVariant='h3'
          />
        )}
        {headerSubtitle && (
          <Header.Subtitle
            localizationKey={headerSubtitle}
            variant='body'
          />
        )}
      </Header.Root>
      <Col gap={8}>{children}</Col>
    </Col>
  );
};
