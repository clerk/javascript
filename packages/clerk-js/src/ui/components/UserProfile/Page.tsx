import React from 'react';

import { Col, descriptors, LocalizationKey } from '../../customizables';
import { CardAlert, Header, useCardState } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';
import { Breadcrumbs } from './Breadcrumbs';
import { NavbarMenuButtonRow } from './Navbar';

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle: LocalizationKey;
};

const Page = (props: PageProps) => {
  const { headerTitle, children, ...rest } = props;
  const card = useCardState();

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
      {...rest}
      sx={t => ({ minHeight: t.sizes.$120 })}
    >
      <NavbarMenuButtonRow />
      <CardAlert>{card.error}</CardAlert>
      <Header.Root gap={5}>
        <Breadcrumbs title={headerTitle} />
        <Header.Title
          localizationKey={headerTitle}
          textVariant='xlargeMedium'
        />
      </Header.Root>
      <Col gap={8}>{children}</Col>
    </Col>
  );
};

export const ContentPage = {
  Root: Page,
};
