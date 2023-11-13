import React from 'react';

import { Col, descriptors, Heading, Text } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { BackLink as BackLinkEl } from './BackLink';

const Root = React.memo((props: PropsOfComponent<typeof Col>): JSX.Element => {
  return (
    <Col
      elementDescriptor={descriptors.header}
      gap={1}
      {...props}
    />
  );
});

const Title = React.memo((props: PropsOfComponent<typeof Heading>): JSX.Element => {
  return (
    <Heading
      elementDescriptor={descriptors.headerTitle}
      {...props}
    />
  );
});

const Subtitle = React.memo((props: PropsOfComponent<typeof Text>): JSX.Element => {
  return (
    <Text
      elementDescriptor={descriptors.headerSubtitle}
      variant='headingRegularRegular'
      colorScheme='neutral'
      {...props}
    />
  );
});

const BackLink = (props: PropsOfComponent<typeof BackLinkEl>) => {
  return (
    <BackLinkEl
      boxElementDescriptor={descriptors.headerBackRow}
      linkElementDescriptor={descriptors.headerBackLink}
      iconElementDescriptor={descriptors.headerBackIcon}
      {...props}
    />
  );
};

export const Header = {
  Root,
  Title,
  Subtitle,
  BackLink,
};
