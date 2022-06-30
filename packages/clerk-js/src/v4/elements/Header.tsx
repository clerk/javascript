import React from 'react';

import { descriptors, Flex, Heading, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { BackLink as BackLinkEl } from './BackLink';

const Root = React.memo((props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.header}
      {...props}
      direction='col'
      gap={1}
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

const Subtitle = React.memo((props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      elementDescriptor={descriptors.headerSubtitle}
      {...props}
      variant='textRegularRegular'
      colorScheme='neutral'
    />
  );
});

const BackLink = (props: PropsOfComponent<typeof BackLinkEl>) => {
  return <BackLinkEl {...props} />;
};

export const Header = {
  Root,
  Title,
  Subtitle,
  BackLink,
};
