import React from 'react';

import { useOptions } from '../../ui/contexts';
import { descriptors, Flex, Link, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { RouterLink } from './RouterLink';

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
      variant='textSmallRegular'
      colorScheme='neutral'
    />
  );
};

const FooterActionLink = (props: PropsOfComponent<typeof RouterLink>): JSX.Element => {
  return (
    <RouterLink
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
  const paths = useOptions().paths || {};
  return (
    <Flex
      elementDescriptor={descriptors.footerPages}
      justify='between'
      gap={3}
    >
      {paths.helpPageUrl && (
        <FooterLink
          elementId={descriptors.footerPagesLink.setId('help')}
          isExternal
          href={paths.helpPageUrl}
        >
          Help
        </FooterLink>
      )}
      {paths.privacyPageUrl && (
        <FooterLink
          elementId={descriptors.footerPagesLink.setId('privacy')}
          isExternal
          href={paths.privacyPageUrl}
        >
          Privacy
        </FooterLink>
      )}
      {paths.termsPageUrl && (
        <FooterLink
          elementId={descriptors.footerPagesLink.setId('terms')}
          isExternal
          href={paths.termsPageUrl}
        >
          Terms
        </FooterLink>
      )}
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
