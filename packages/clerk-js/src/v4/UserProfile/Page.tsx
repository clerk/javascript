import React from 'react';

import { Col, Flex } from '../customizables';
import { CardAlert, Header, useCardState } from '../elements';
import { PropsOfComponent } from '../styledSystem';

type PageProps = PropsOfComponent<typeof Col> & {
  headerTitle: string;
};

const Page = (props: PageProps) => {
  const { headerTitle, children, ...rest } = props;
  const card = useCardState();

  return (
    <Col
      gap={8}
      sx={theme => ({ minHeight: theme.space.$140 })}
      {...rest}
    >
      <CardAlert>{card.error}</CardAlert>
      <Header.Root>
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
