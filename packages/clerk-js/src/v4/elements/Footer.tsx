import React from 'react';

import { Flex, Link, LinkProps, Text } from '../primitives';

const FooterRoot = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      {...props}
      justify='between'
      align='center'
    />
  );
};

const FooterAction = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      {...props}
      gap={1}
    />
  );
};

const FooterActionText = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      {...props}
      as='span'
      variant='link'
    />
  );
};

const FooterActionLink = (props: React.PropsWithChildren<LinkProps>): JSX.Element => {
  return (
    <Link
      {...props}
      colorScheme='primary'
    />
  );
};

const FooterLinks = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      {...props}
      justify='between'
      gap={4}
    />
  );
};

const FooterLink = (props: React.PropsWithChildren<LinkProps>): JSX.Element => {
  return (
    <Link
      {...props}
      colorScheme='neutral'
    />
  );
};

export const Footer = {
  Root: FooterRoot,
  Action: FooterAction,
  ActionLink: FooterActionLink,
  ActionText: FooterActionText,
  Links: FooterLinks,
  Link: FooterLink,
};
