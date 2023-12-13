import React from 'react';

import { useEnvironment } from '../contexts';
import { Col, descriptors, Flex, Flow, Link, localizationKeys, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { animations } from '../styledSystem';
import { BaseCard } from './Card';
import { PoweredByClerkTag } from './PoweredByClerk';

const PopoverCardRoot = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof BaseCard>>((props, ref) => {
  return (
    <Flow.Part part='popover'>
      <BaseCard
        {...props}
        ref={ref}
        sx={t => ({
          width: t.sizes.$94,
          maxWidth: `calc(100vw - ${t.sizes.$8})`,
          zIndex: t.zIndices.$modal,
          animation: `${animations.dropdownSlideInScaleAndFade} 140ms `,
          border: `1px solid ${t.colors.$blackAlpha200}`,
        })}
      >
        {props.children}
      </BaseCard>
    </Flow.Part>
  );
});

const PopoverCardMain = (props: PropsOfComponent<typeof Flex>) => {
  const { sx, ...rest } = props;
  return (
    <Flex
      direction='col'
      sx={[t => ({ backgroundColor: t.colors.$colorBackground, borderRadius: t.radii.$lg, overflow: 'hidden' }), sx]}
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
        {
          borderBottomLeftRadius: 'inherit',
          borderBottomRightRadius: 'inherit',
          '&:empty': {
            padding: '0',
          },
        },
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
  Main: PopoverCardMain,
  Footer: PopoverCardFooter,
};
