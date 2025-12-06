import React from 'react';

import { useEnvironment } from '../contexts';
import { Col, descriptors, Flex, Flow, useAppearance } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';
import { animations, common } from '../styledSystem';
import { colors } from '../utils/colors';
import { Card } from './Card';

const PopoverCardRoot = React.forwardRef<
  HTMLDivElement,
  PropsOfComponent<typeof Card.Content> & {
    shouldEntryAnimate?: boolean;
  }
>((props, ref) => {
  const { elementDescriptor, shouldEntryAnimate = true, ...rest } = props;

  const withAnimation: ThemableCssProp = t => ({
    animation: shouldEntryAnimate
      ? `${animations.dropdownSlideInScaleAndFade} ${t.transitionDuration.$fast}`
      : undefined,
  });

  return (
    <Flow.Part part='popover'>
      <Card.Root
        elementDescriptor={[descriptors.popoverBox, elementDescriptor as ElementDescriptor]}
        {...rest}
        ref={ref}
        sx={[
          t => ({
            width: t.sizes.$94,
            maxWidth: `calc(100vw - ${t.sizes.$8})`,
            zIndex: t.zIndices.$modal,
            borderRadius: t.radii.$xl,
            outline: 'none',
          }),
          withAnimation,
        ]}
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
          borderColor: t.colors.$borderAlpha150,
          marginInline: '-1px',
          marginBlockStart: '-1px',
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
  const { privacyPageUrl, termsPageUrl, helpPageUrl } = useAppearance().parsedOptions;
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
          marginTop: `calc(${t.space.$2} * -1)`,
          paddingTop: t.space.$2,
          '&:empty': {
            padding: 0,
            marginTop: 0,
          },
          '>:not(:first-of-type)': {
            padding: `${t.space.$4} ${t.space.$8}`,
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$borderAlpha100,
          },
        }),
        sx,
      ]}
      {...rest}
    >
      {children}

      <Card.ClerkAndPagesTag
        outerSx={t => ({
          padding: `${t.space.$4} ${t.space.$8}`,
        })}
        withFooterPages={!!shouldShowTagOrLinks}
        devModeNoticeSx={t => ({
          padding: t.space.$none,
        })}
        withDevOverlay
      />
    </Col>
  );
};

export const PopoverCard = {
  Root: PopoverCardRoot,
  Content: PopoverCardContent,
  Footer: PopoverCardFooter,
};
