import React from 'react';

import { Col, descriptors } from '../customizables';
import { CardAlert, Header, useCardState } from '../elements';
import { PropsOfComponent } from '../styledSystem';
import { Breadcrumbs } from './Breadcrumbs';
import { NavbarMenuButtonRow } from './Navbar';

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle: string;
};

const Page = (props: PageProps) => {
  const { headerTitle, children, ...rest } = props;
  const card = useCardState();

  return (
    <Col
      elementDescriptor={descriptors.page}
      gap={8}
      {...rest}
      sx={t => ({
        // This needs to be less than the modal's max height
        minHeight: t.sizes.$120,
        // paddingBottom: '80px',
        // maxHeight: `min(${t.sizes.$176}, calc(100vh - ${t.sizes.$20}))`,
      })}
    >
      <NavbarMenuButtonRow />
      <CardAlert>{card.error}</CardAlert>
      <Header.Root gap={5}>
        <Breadcrumbs title={headerTitle} />
        <Header.Title textVariant='xlargeMedium'>{headerTitle}</Header.Title>
      </Header.Root>
      <Col gap={8}>{children}</Col>
    </Col>
  );
};

export const ContentPage = {
  Root: Page,
};
