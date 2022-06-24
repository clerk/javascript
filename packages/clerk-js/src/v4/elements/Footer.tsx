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
      sx={theme => ({ marginTop: theme.space.$8 })}
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
      variant='textSmallRegular'
      colorScheme='neutral'
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

const FooterLink = (props: PropsOfComponent<typeof Link>): JSX.Element => {
  return (
    <Link
      elementDescriptor={descriptors.footerPagesLink}
      {...props}
      colorScheme='neutral'
    />
  );
};

const FooterLinks = React.memo((): JSX.Element => {
  return (
    <Flex
      elementDescriptor={descriptors.footerPages}
      justify='between'
      gap={4}
    >
      <FooterLink
        elementId={descriptors.footerPagesLink.setId('help')}
        isExternal
        href='https://www.google.com'
      >
        Help
      </FooterLink>
      <FooterLink
        elementId={descriptors.footerPagesLink.setId('privacy')}
        isExternal
        href='https://www.google.com'
      >
        Privacy
      </FooterLink>
      <FooterLink
        elementId={descriptors.footerPagesLink.setId('terms')}
        isExternal
        href='https://www.google.com'
      >
        Terms
      </FooterLink>
    </Flex>
  );
});

export const Footer = {
  Root: FooterRoot,
  Action: FooterAction,
  ActionLink: FooterActionLink,
  ActionText: FooterActionText,
  Links: FooterLinks,
  Link: FooterLink,
};
