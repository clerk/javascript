import React from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Flow, Link, localizationKeys, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { animations } from '../styledSystem';
import { BaseCard } from './Card';
import { PoweredByClerkText } from './PoweredByClerk';

const PopoverCardRoot = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof BaseCard>>((props, ref) => {
  return (
    <Flow.Part part='popover'>
      <BaseCard
        {...props}
        ref={ref}
        sx={t => ({
          padding: `${t.space.$6} 0`,
          width: t.sizes.$94,
          maxWidth: `calc(100vw - ${t.sizes.$8})`,
          zIndex: t.zIndices.$modal,
          animation: `${animations.dropdownSlideInScaleAndFade} 140ms `,
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
      sx={sx}
      {...rest}
    >
      {props.children}
    </Flex>
  );
};

const PopoverCardFooter = (props: PropsOfComponent<typeof Flex>) => {
  const { sx, ...rest } = props;
  const { branded } = useEnvironment().displayConfig;
  const { privacyPageUrl, termsPageUrl } = useAppearance().parsedLayout;
  const shouldShow = branded || privacyPageUrl || termsPageUrl;

  if (!shouldShow) {
    return null;
  }

  return (
    <Flex
      justify='between'
      sx={[
        theme => ({
          padding: `${theme.space.$6}`,
          paddingBottom: 0,
          '&:empty': {
            padding: '0',
          },
        }),
        sx,
      ]}
      {...rest}
    >
      <PoweredByClerkText />
      <PopoverCardLinks />
    </Flex>
  );
};

const PopoverCardLink = (props: PropsOfComponent<typeof Link>) => {
  return (
    <Link
      colorScheme='neutral'
      isExternal
      size='xss'
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
