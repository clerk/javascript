import React from 'react';

import { descriptors, Flex, Link, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

const FooterRoot = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.footer}
      {...props}
      justify='between'
      align='center'
    />
  );
};

const FooterAction = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.footerAction}
      {...props}
      gap={1}
    />
  );
};

const FooterActionText = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Text
      elementDescriptor={descriptors.footerActionText}
      {...props}
      as='span'
      variant='link'
    />
  );
};

const FooterActionLink = (props: PropsOfComponent<typeof Link>): JSX.Element => {
  return (
    <Link
      elementDescriptor={descriptors.footerActionLink}
      {...props}
      colorScheme='primary'
    />
  );
};

// TODO: Naming?
const FooterLinks = (props: React.PropsWithChildren<any>): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.footerPages}
      {...props}
      justify='between'
      gap={4}
    />
  );
};

const FooterLink = (props: PropsOfComponent<typeof Link>): JSX.Element => {
  return (
    <Link
      elementDescriptor={descriptors.footerPagesLink}
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
