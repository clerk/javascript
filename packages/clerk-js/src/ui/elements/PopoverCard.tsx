import React from 'react';

import { useEnvironment } from '../contexts';
import { Col, Flex, Flow, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { animations, common } from '../styledSystem';
import { Card } from '.';

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
  const { privacyPageUrl, termsPageUrl, helpPageUrl } = useAppearance().parsedLayout;
  const shouldShowTagOrLinks = branded || privacyPageUrl || termsPageUrl || helpPageUrl;

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

      {shouldShowTagOrLinks && (
        <Card.ClerkAndPagesTag
          withFooterPages
          sx={t => ({ padding: `${t.space.$4} ${t.space.$8}` })}
        />
      )}
    </Col>
  );
};

export const PopoverCard = {
  Root: PopoverCardRoot,
  Content: PopoverCardContent,
  Footer: PopoverCardFooter,
};
