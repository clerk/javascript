import type { ComponentProps } from 'react';

import { Box, CheckboxInput, descriptors, Flex, Text } from '@/ui/customizables';
import type { InternalTheme } from '@/ui/styledSystem';
import { common } from '@/ui/styledSystem';
import { colors } from '@/ui/utils/colors';

export function ListGroup({ children, sx, ...props }: Omit<ComponentProps<typeof Box>, 'elementDescriptor'>) {
  return (
    <Box
      {...props}
      sx={[
        t => ({
          textAlign: 'start',
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha100,
          borderRadius: t.radii.$lg,
          overflow: 'hidden',
        }),
        sx,
      ]}
      elementDescriptor={descriptors.listGroup}
    >
      {children}
    </Box>
  );
}

export function ListGroupHeader({ children, sx, ...props }: Omit<ComponentProps<typeof Box>, 'elementDescriptor'>) {
  return (
    <Box
      {...props}
      sx={[
        t => ({
          padding: t.space.$3,
          background: common.mergedColorsBackground(
            colors.setAlpha(t.colors.$colorBackground, 1),
            t.colors.$neutralAlpha50,
          ),
        }),
        sx,
      ]}
      elementDescriptor={descriptors.listGroupHeader}
    >
      {children}
    </Box>
  );
}

export function ListGroupHeaderTitle(props: Omit<ComponentProps<typeof Text>, 'elementDescriptor'>) {
  return (
    <Text
      {...props}
      variant='subtitle'
      elementDescriptor={descriptors.listGroupHeaderTitle}
    />
  );
}

export function ListGroupContent({
  children,
  sx,
  ...props
}: Omit<ComponentProps<typeof Box>, 'as' | 'elementDescriptor'>) {
  return (
    <Box
      {...props}
      as='ul'
      sx={[
        t => ({
          margin: t.sizes.$none,
          padding: t.sizes.$none,
          maxBlockSize: '10.9375rem',
          backgroundColor: t.colors.$colorBackground,
          overflowY: 'auto',
          ...common.unstyledScrollbar(t),
          '--fade-distance': '2rem',
          '&::before, &::after': {
            content: '""',
            display: 'block',
            position: 'sticky',
            insetInline: 0,
            blockSize: 'var(--fade-distance)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0,
          },
          '&::before': {
            insetBlockStart: 0,
            marginBlockEnd: 'calc(var(--fade-distance) * -1)',
            background: `linear-gradient(to bottom, ${t.colors.$colorBackground}, transparent)`,
          },
          '&::after': {
            insetBlockEnd: 0,
            marginBlockStart: 'calc(var(--fade-distance) * -1)',
            background: `linear-gradient(to top, ${t.colors.$colorBackground}, transparent)`,
          },
          '@keyframes list-fade-top': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          '@keyframes list-fade-bottom': {
            from: { opacity: 1 },
            to: { opacity: 0 },
          },
          '@supports (animation-timeline: scroll())': {
            '&::before': {
              animationName: 'list-fade-top',
              animationDuration: 'auto',
              animationTimingFunction: 'linear',
              animationFillMode: 'both',
              animationTimeline: 'scroll(y)',
              animationRange: '0 var(--fade-distance)',
            },
            '&::after': {
              animationName: 'list-fade-bottom',
              animationDuration: 'auto',
              animationTimingFunction: 'linear',
              animationFillMode: 'both',
              animationTimeline: 'scroll(y)',
              animationRange: 'calc(100% - var(--fade-distance)) 100%',
            },
          },
        }),
        sx,
      ]}
      elementDescriptor={descriptors.listGroupContent}
    >
      {children}
    </Box>
  );
}

const listGroupItemStyles = (t: InternalTheme) => ({
  paddingInline: t.space.$3,
  paddingBlock: t.space.$2,
  borderTopWidth: t.borderWidths.$normal,
  borderTopStyle: t.borderStyles.$solid,
  borderTopColor: t.colors.$borderAlpha100,
});

export function ListGroupItem({
  children,
  sx,
  ...props
}: Omit<ComponentProps<typeof Box>, 'as' | 'elementDescriptor'>) {
  return (
    <Box
      {...props}
      as='li'
      sx={[
        t => ({
          ...listGroupItemStyles(t),
          display: 'flex',
          alignItems: 'baseline',
          '&::before': {
            content: '""',
            display: 'inline-block',
            width: t.space.$1,
            height: t.space.$1,
            background: t.colors.$colorMutedForeground,
            borderRadius: t.radii.$circle,
            transform: 'translateY(-0.1875rem)',
            marginInlineEnd: t.space.$2,
            flexShrink: 0,
          },
        }),
        sx,
      ]}
      elementDescriptor={descriptors.listGroupItem}
    >
      {children}
    </Box>
  );
}

export function ListGroupItemLabel(props: Omit<ComponentProps<typeof Text>, 'elementDescriptor'>) {
  return (
    <Text
      {...props}
      variant='subtitle'
      elementDescriptor={descriptors.listGroupItemLabel}
    />
  );
}

export function ListGroupCheckboxItem({
  children,
  ...props
}: Pick<ComponentProps<typeof CheckboxInput>, 'checked' | 'value' | 'isDisabled' | 'onChange'> & {
  children: ComponentProps<typeof Text>['children'];
}) {
  return (
    <Box
      as='li'
      sx={listGroupItemStyles}
      elementDescriptor={descriptors.listGroupItem}
    >
      <Flex
        as='label'
        align='start'
        gap={2}
        sx={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <CheckboxInput
          {...props}
          focusRing={false}
          elementDescriptor={descriptors.listGroupItemCheckbox}
          sx={t => ({
            flexShrink: 0,
            cursor: 'pointer',
            marginBlockStart: `calc((${t.fontSizes.$md} * ${t.lineHeights.$small} - ${t.sizes.$4}) / 2)`,
          })}
        />
        <ListGroupItemLabel as='span'>{children}</ListGroupItemLabel>
      </Flex>
    </Box>
  );
}
