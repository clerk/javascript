import React from 'react';

import { useEnvironment } from '../contexts';
import { Col, descriptors, Flex, Flow, Link, localizationKeys, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { animations, common } from '../styledSystem';
import { Card } from '.';
import { PoweredByClerkTag } from './PoweredByClerk';

const PopoverCardRoot = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Card.Content>>((props, ref) => {
  return (
    <Flow.Part part='popover'>
      <Card.Root
        {...props}
        ref={ref}
        sx={t => ({
          width: t.sizes.$94,
          maxWidth: `calc(100vw - ${t.sizes.$8})`,
          zIndex: t.zIndices.$modal,
          borderRadius: t.radii.$lg,
          animation: `${animations.dropdownSlideInScaleAndFade} 140ms `,
        })}
      >
        {props.children}
      </Card.Root>
    </Flow.Part>
  );
});

const PopoverCardContent = (props: PropsOfComponent<typeof Flex>) => {
  const { sx, ...rest } = props;
  return (
    <Flex
      direction='col'
      sx={[
        t => ({
          backgroundColor: t.colors.$colorBackground,
          overflow: 'hidden',
          borderRadius: t.radii.$lg,
          zIndex: t.zIndices.$card,
          boxShadow: common.shadows(t).cardContentShadow,
        }),
        sx,
      ]}
      {...rest}
    >
      {props.children}
    </Flex>
  );
};

const PopoverCardFooter = (props: PropsOfComponent<typeof Flex>) => {
  const { sx, children, ...rest } = props;
  const { branded } = useEnvironment().displayConfig;
  const { privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;
  const shouldShow = branded || privacyPageUrl || termsPageUrl;

  if (!shouldShow) {
    return null;
  }

  return (
    <Col
      justify='between'
      sx={[
        t => ({
          background: `linear-gradient(${t.colors.$blackAlpha100},${t.colors.$blackAlpha100}), linear-gradient(${t.colors.$colorBackground}, ${t.colors.$colorBackground})`,
          marginTop: `-${t.space.$2}`,
          paddingTop: t.space.$2,
          borderBottomLeftRadius: 'inherit',
          borderBottomRightRadius: 'inherit',
          '&:empty': {
            padding: '0',
          },
        }),
        sx,
      ]}
      {...rest}
    >
      {children}
      <PoweredByClerkTag sx={t => ({ padding: `${t.space.$4} 0` })} />
      <PopoverCardLinks />
    </Col>
  );
};

const PopoverCardLink = (props: PropsOfComponent<typeof Link>) => {
  return (
    <Link
      colorScheme='neutral'
      isExternal
      {...props}
    />
  );
};

const PopoverCardLinks = (props: PropsOfComponent<typeof Flex>) => {
  const { sx, ...rest } = props;
  const { privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;

  if (!termsPageUrl && !privacyPageUrl) {
    return null;
  }

  return (
    <Flex
      gap={4}
      sx={sx}
      {...rest}
    >
      {termsPageUrl && (
        <PopoverCardLink
          localizationKey={localizationKeys('footerPageLink__terms')}
          elementDescriptor={descriptors.userButtonPopoverFooterPagesLink}
          elementId={descriptors.userButtonPopoverFooterPagesLink.setId('terms')}
          href={termsPageUrl}
        />
      )}
      {privacyPageUrl && (
        <PopoverCardLink
          localizationKey={localizationKeys('footerPageLink__privacy')}
          elementDescriptor={descriptors.userButtonPopoverFooterPagesLink}
          elementId={descriptors.userButtonPopoverFooterPagesLink.setId('privacy')}
          href={privacyPageUrl}
        />
      )}
    </Flex>
  );
};

export const PopoverCard = {
  Root: PopoverCardRoot,
  Content: PopoverCardContent,
  Footer: PopoverCardFooter,
};
