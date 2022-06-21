import React from 'react';

import { descriptors, Flex, Heading, Text } from '../customizables';

const Root = React.memo((props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.header}
      {...props}
      direction='col'
      gap={1}
      sx={theme => ({ marginBottom: theme.space.$8 })}
    />
  );
});

const Title = React.memo((props: React.PropsWithChildren<any>): JSX.Element => {
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
      variant='subheading'
      colorScheme='neutral'
    />
  );
});

export const Header = {
  Root,
  Title,
  Subtitle,
};
