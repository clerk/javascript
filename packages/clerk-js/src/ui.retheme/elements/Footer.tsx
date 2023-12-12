import type { FooterActionId } from '@clerk/types';
import React from 'react';

import { descriptors, Flex, Link, localizationKeys, Text, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { mqu } from '../styledSystem';
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

type FooterActionProps = Omit<PropsOfComponent<typeof Flex>, 'elementId'> & {
  elementId?: FooterActionId;
};
const FooterAction = (props: FooterActionProps): JSX.Element => {
  const { elementId, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.footerAction}
      elementId={descriptors.footerAction.setId(elementId)}
      {...rest}
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
      variant='body'
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
  const { helpPageUrl, privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;

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
      {helpPageUrl && (
        <FooterLink
          localizationKey={localizationKeys('footerPageLink__help')}
          elementId={descriptors.footerPagesLink.setId('help')}
          isExternal
          href={helpPageUrl}
        />
      )}
      {privacyPageUrl && (
        <FooterLink
          localizationKey={localizationKeys('footerPageLink__privacy')}
          elementId={descriptors.footerPagesLink.setId('privacy')}
          isExternal
          href={privacyPageUrl}
        />
      )}
      {termsPageUrl && (
        <FooterLink
          localizationKey={localizationKeys('footerPageLink__terms')}
          elementId={descriptors.footerPagesLink.setId('terms')}
          isExternal
          href={termsPageUrl}
        />
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
