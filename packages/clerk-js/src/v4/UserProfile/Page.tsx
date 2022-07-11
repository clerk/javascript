import React from 'react';

import { Col, descriptors, Flex } from '../customizables';
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
        height: t.sizes.$176,
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

const Toolbar = (props: React.PropsWithChildren<{}>) => {
  return (
    <Flex
      direction='rowReverse'
      justify='start'
      gap={4}
      sx={theme => ({
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        padding: `${theme.space.$5} ${theme.space.$8}`,
        borderTop: `${theme.borders.$normal} ${theme.colors.$blackAlpha300}`,
      })}
      {...props}
    />
  );
};

export const ContentPage = {
  Root: Page,
  Toolbar: Toolbar,
};
