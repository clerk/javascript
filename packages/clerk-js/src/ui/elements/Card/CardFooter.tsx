import React from 'react';

import { useEnvironment } from '../../contexts';
import { descriptors, Flex, Link, localizationKeys, useAppearance } from '../../customizables';
import { common, mqu, type PropsOfComponent } from '../../styledSystem';
import { colors } from '../../utils';
import { Card } from '.';
type CardFooterProps = PropsOfComponent<typeof Flex>;
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
  const { children, sx, ...rest } = props;
  const { branded } = useEnvironment().displayConfig;
  const { helpPageUrl, privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;
  const showSponsor = !!(branded || helpPageUrl || privacyPageUrl || termsPageUrl);

  return (
    <Flex
      direction='col'
      align='center'
      justify='center'
      elementDescriptor={descriptors.footer}
      sx={[
        t => ({
          marginTop: `-${t.space.$2}`,
          paddingTop: t.space.$2,
          background: common.mergedColorsBackground(colors.setAlpha(t.colors.$background, 0.8), t.colors.$blackAlpha50),
          backdropFilter: t.backdropFilters.$defaultBlur,
          '>:first-of-type': {
            padding: `${t.space.$4} ${t.space.$8} ${t.space.$4} ${t.space.$8}`,
          },
          '>:not(:first-of-type)': {
            padding: `${t.space.$4} ${t.space.$8}`,
            borderTop: t.borders.$normal,
            borderColor: t.colors.$blackAlpha100,
          },
        }),
        sx,
      ]}
      {...rest}
      ref={ref}
    >
      {children}

      {showSponsor && <Card.ClerkAndPagesTag withFooterPages />}
    </Flex>
  );
});

const CardFooterLink = (props: PropsOfComponent<typeof Link>): JSX.Element => {
  return (
    <Link
      elementDescriptor={descriptors.footerPagesLink}
      {...props}
      colorScheme='neutral'
    />
  );
};

export const CardFooterLinks = React.memo((): JSX.Element | null => {
  const { helpPageUrl, privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;

  if (!helpPageUrl && !privacyPageUrl && !termsPageUrl) return null;

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
