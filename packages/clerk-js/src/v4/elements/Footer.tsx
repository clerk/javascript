import React from 'react';

import { useOptions } from '../../ui/contexts';
import { descriptors, Flex, Link, Text } from '../customizables';
import { mqu, PropsOfComponent } from '../styledSystem';
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
      variant='smallRegular'
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
  const links = useOptions().links || {};
  return (
    <Flex
      elementDescriptor={descriptors.footerPages}
      justify='between'
      sx={t => ({
        gap: t.space.$3,
        [mqu.xs]: {
          gap: t.space.$2,
        },
      })}
    >
      {links.helpPageUrl && (
        <FooterLink
          elementId={descriptors.footerPagesLink.setId('help')}
          isExternal
          href={links.helpPageUrl}
        >
          Help
        </FooterLink>
      )}
      {links.privacyPageUrl && (
        <FooterLink
          elementId={descriptors.footerPagesLink.setId('privacy')}
          isExternal
          href={links.privacyPageUrl}
        >
          Privacy
        </FooterLink>
      )}
      {links.termsPageUrl && (
        <FooterLink
          elementId={descriptors.footerPagesLink.setId('terms')}
          isExternal
          href={links.termsPageUrl}
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
