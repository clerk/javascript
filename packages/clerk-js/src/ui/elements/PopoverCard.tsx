import React from 'react';

import { useEnvironment } from '../contexts';
import { Col, Flex, Flow, useAppearance } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { animations, common } from '../styledSystem';
import { colors } from '../utils';
import { Card, DevModeOverlay } from '.';

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
          borderRadius: t.radii.$xl,
          animation: `${animations.dropdownSlideInScaleAndFade} ${t.transitionDuration.$fast}`,
          outline: 'none',
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
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$neutralAlpha50,
          boxShadow: t.shadows.$cardContentShadow,
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
          background: common.mergedColorsBackground(
            colors.setAlpha(t.colors.$colorBackground, 1),
            t.colors.$neutralAlpha50,
          ),
          marginTop: `-${t.space.$2}`,
          paddingTop: t.space.$2,
          borderBottomLeftRadius: 'inherit',
          borderBottomRightRadius: 'inherit',
          '&:empty': {
            padding: 0,
            marginTop: 0,
          },
          '>:not(:first-of-type)': {
            padding: `${t.space.$4} ${t.space.$8}`,
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$neutralAlpha100,
          },
        }),
        sx,
      ]}
      {...rest}
    >
      <DevModeOverlay />
      {children}

      {shouldShowTagOrLinks && (
        <Card.ClerkAndPagesTag
          withFooterPages
          withDevModeNotice
          devModeNoticeSx={t => ({
            padding: t.space.$none,
          })}
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
