import React from 'react';

import { descriptors, Flex, Heading, Text } from '../customizables';

const HeaderRoot = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.header}
      {...props}
      direction='col'
      gap={1}
    />
  );
};

const HeaderTitle = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Heading
      elementDescriptor={descriptors.headerTitle}
      {...props}
    />
  );
};

const HeaderSubtitle = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      elementDescriptor={descriptors.headerSubtitle}
      {...props}
      variant='subheading'
      colorScheme='neutral'
    />
  );
};

export const Header = {
  Root: HeaderRoot,
  Title: HeaderTitle,
  Subtitle: HeaderSubtitle,
};
