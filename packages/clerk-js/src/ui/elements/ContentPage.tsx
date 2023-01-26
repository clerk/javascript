import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { CardAlert, Header, NavbarMenuButtonRow, useCardState } from './index';

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle: LocalizationKey;
  Breadcrumbs?: React.ComponentType<any> | null;
  headerSubtitle?: LocalizationKey;
};

export const ContentPage = (props: PageProps) => {
  const { headerTitle, headerSubtitle, children, Breadcrumbs, sx, ...rest } = props;
  const card = useCardState();

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
      {...rest}
      sx={[t => ({ minHeight: t.sizes.$120 }), sx]}
    >
      <NavbarMenuButtonRow />
      <CardAlert>{card.error}</CardAlert>
      <Header.Root>
        {Breadcrumbs && (
          <Breadcrumbs
            title={headerTitle}
            sx={(t: any) => ({ marginBottom: t.space.$5 })}
          />
        )}
        <Header.Title
          // TODO: Align them between user profile and org profile
          localizationKey={headerTitle}
          textVariant={'xxlargeMedium'}
        />
        <Header.Subtitle
          variant={'regularRegular'}
          localizationKey={headerSubtitle}
        />
      </Header.Root>
      <Col gap={8}>{children}</Col>
    </Col>
  );
};
