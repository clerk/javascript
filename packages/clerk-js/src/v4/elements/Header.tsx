import React from 'react';

import { Flex, Heading, Text } from '../primitives';

// const keys = createAppearanceKeys("header", ["title", "subtitle"] as const);

const HeaderRoot = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      {...props}
      direction='col'
      gap={1}
    />
  );
};

const HeaderTitle = (props: React.PropsWithChildren<any>): JSX.Element => {
  return <Heading {...props} />;
};

const HeaderSubtitle = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      {...props}
      variant='subheading'
    />
  );
};

export const Header = {
  Root: HeaderRoot,
  Title: HeaderTitle,
  Subtitle: HeaderSubtitle,
};
