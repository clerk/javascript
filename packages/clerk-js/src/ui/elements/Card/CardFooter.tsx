import React from 'react';

import { useEnvironment } from '../../contexts';
import { descriptors, Flex, Link, localizationKeys, useAppearance } from '../../customizables';
import type { InternalTheme, PropsOfComponent } from '../../styledSystem';
import { common, mqu } from '../../styledSystem';
import { colors } from '../../utils';
import { DevModeOverlay } from '../DevModeNotice';
import { Card } from '.';

type CardFooterProps = PropsOfComponent<typeof Flex> & {
  isProfileFooter?: boolean;
};
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
  const { children, isProfileFooter = false, sx, ...rest } = props;
  const { branded } = useEnvironment().displayConfig;
  const { helpPageUrl, privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;
  const sponsorOrLinksExist = !!(branded || helpPageUrl || privacyPageUrl || termsPageUrl);
  const showSponsorAndLinks = isProfileFooter ? branded : sponsorOrLinksExist;

  if (!children && !showSponsorAndLinks) {
    return null;
  }

  const footerStyles = (t: InternalTheme) => ({
    '>:first-of-type': {
      padding: `${t.space.$4} ${t.space.$8} ${t.space.$4} ${t.space.$8}`,
    },
    '>:not(:first-of-type)': {
      padding: `${t.space.$4} ${t.space.$8}`,
      borderTopWidth: t.borderWidths.$normal,
      borderTopStyle: t.borderStyles.$solid,
      borderTopColor: t.colors.$neutralAlpha100,
    },
  });

  const profileCardFooterStyles = (t: InternalTheme) => ({
    padding: `${t.space.$4} ${t.space.$6} ${t.space.$2}`,
  });

  return (
    <Flex
      direction='col'
      align='center'
      justify='center'
      elementDescriptor={descriptors.footer}
      sx={[
        t => ({
          position: 'relative',
          marginTop: `-${t.space.$2}`,
          paddingTop: t.space.$2,
          background: common.mergedColorsBackground(
            colors.setAlpha(t.colors.$colorBackground, 1),
            t.colors.$neutralAlpha50,
          ),
          '&:empty': {
            padding: 0,
            marginTop: 0,
          },
        }),
        isProfileFooter ? profileCardFooterStyles : footerStyles,
        sx,
      ]}
      {...rest}
      ref={ref}
    >
      <DevModeOverlay />

      {children}

      <Card.ClerkAndPagesTag
        withFooterPages={showSponsorAndLinks && !isProfileFooter}
        devModeNoticeSx={t => ({
          padding: t.space.$none,
        })}
      />
    </Flex>
  );
});

const CardFooterLink = (props: PropsOfComponent<typeof Link>): JSX.Element => {
  return (
    <Link
      elementDescriptor={descriptors.footerPagesLink}
      {...props}
      colorScheme='neutral'
      variant='buttonSmall'
    />
  );
};

export const CardFooterLinks = React.memo((): JSX.Element | null => {
  const { helpPageUrl, privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;

  if (!helpPageUrl && !privacyPageUrl && !termsPageUrl) {
    return null;
  }

  return (
    <Flex
      elementDescriptor={descriptors.footerPages}
      justify='between'
      sx={t => ({
        gap: t.space.$3,
        [mqu.sm]: {
          gap: t.space.$2,
        },
      })}
    >
      {helpPageUrl && (
        <CardFooterLink
          localizationKey={localizationKeys('footerPageLink__help')}
          elementId={descriptors.footerPagesLink.setId('help')}
          isExternal
          href={helpPageUrl}
        />
      )}
      {privacyPageUrl && (
        <CardFooterLink
          localizationKey={localizationKeys('footerPageLink__privacy')}
          elementId={descriptors.footerPagesLink.setId('privacy')}
          isExternal
          href={privacyPageUrl}
        />
      )}
      {termsPageUrl && (
        <CardFooterLink
          localizationKey={localizationKeys('footerPageLink__terms')}
          elementId={descriptors.footerPagesLink.setId('terms')}
          isExternal
          href={termsPageUrl}
        />
      )}
    </Flex>
  );
});
