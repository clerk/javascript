import React from 'react';

import { Flex, Text } from '../primitives';

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
  return <Flex {...props} />;
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

const FooterActionLink = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      {...props}
      as='span'
      variant='link'
    />
  );
};

const FooterLinks = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      {...props}
      justify='between'
    />
  );
};

const FooterLink = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      {...props}
      as='span'
      variant='link'
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
