import type { ComponentProps } from 'react';

import { Box, descriptors, Text } from '@/ui/customizables';
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
      sx={[t => ({ margin: t.sizes.$none, padding: t.sizes.$none }), sx]}
      elementDescriptor={descriptors.listGroupContent}
    >
      {children}
    </Box>
  );
}

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
          display: 'flex',
          alignItems: 'baseline',
          paddingInline: t.space.$3,
          paddingBlock: t.space.$2,
          borderTopWidth: t.borderWidths.$normal,
          borderTopStyle: t.borderStyles.$solid,
          borderTopColor: t.colors.$borderAlpha100,
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
