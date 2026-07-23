import type { ComponentProps } from 'react';
import React from 'react';

import { Box, descriptors, Flex, Icon } from '@/ui/customizables';
import { LockDottedCircle } from '@/ui/icons';
import type { ThemableCssProp } from '@/ui/styledSystem';
import { common } from '@/ui/styledSystem';
import { colors } from '@/ui/utils/colors';

export function LogoGroup({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      justify='center'
      align='center'
      gap={4}
      sx={t => ({
        marginBlockEnd: t.space.$6,
      })}
      elementDescriptor={descriptors.logoGroup}
    >
      {children}
    </Flex>
  );
}

export function LogoGroupItem({ children, sx, ...props }: ComponentProps<typeof Flex>) {
  return (
    <Flex
      {...props}
      sx={[{ flex: 1 }, sx]}
      elementDescriptor={descriptors.logoGroupItem}
    >
      {children}
    </Flex>
  );
}

export function LogoGroupItemContainer({
  size = 'md',
  sx,
  children,
}: {
  size?: 'sm' | 'md';
  sx?: ThemableCssProp;
  children: React.ReactNode;
}) {
  const scale: ThemableCssProp = t => {
    const container = size === 'sm' ? t.space.$6 : t.space.$12;
    const inner = size === 'sm' ? t.space.$3 : t.space.$5;
    // `&&` doubles the container's specificity so it wins over a bare child
    // (Icon / ApplicationLogo) that sizes itself with a single class.
    return { width: container, height: container, '&& > *': { width: inner, height: inner } };
  };

  return (
    <Box
      sx={t => [
        {
          background: common.mergedColorsBackground(
            colors.setAlpha(t.colors.$colorBackground, 1),
            t.colors.$neutralAlpha50,
          ),
          borderRadius: t.radii.$circle,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        scale,
        sx,
      ]}
      elementDescriptor={descriptors.logoGroupItemContainer}
    >
      {children}
    </Box>
  );
}

export function LogoGroupIcon({
  icon = LockDottedCircle,
  iconSx = t => ({ color: t.colors.$primary500 }),
  label,
}: {
  icon?: React.ComponentType;
  iconSx?: ThemableCssProp;
  /**
   * Accessible name for a meaningful mark (e.g. a recognized client's brand).
   * Omit for the decorative fallback, which is then hidden from assistive tech.
   */
  label?: string;
}) {
  return (
    <Icon
      icon={icon}
      sx={iconSx}
      elementDescriptor={descriptors.logoGroupIcon}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

export function LogoGroupSeparator() {
  return (
    <Box
      as='svg'
      // @ts-ignore - valid SVG attribute
      fill='none'
      viewBox='0 0 16 2'
      height={2}
      aria-hidden
      sx={t => ({ color: t.colors.$colorMutedForeground })}
      elementDescriptor={descriptors.logoGroupSeparator}
    >
      <path
        stroke='currentColor'
        strokeDasharray='0.1 4'
        strokeLinecap='round'
        strokeWidth='2'
        d='M1 1h14'
      />
    </Box>
  );
}
