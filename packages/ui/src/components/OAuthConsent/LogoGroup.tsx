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

export function LogoGroupIcon({ size = 'md', sx }: { size?: 'sm' | 'md'; sx?: ThemableCssProp }) {
  const scale: ThemableCssProp = t => {
    const value = size === 'sm' ? t.space.$6 : t.space.$12;
    return { width: value, height: value };
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
      elementDescriptor={descriptors.logoGroupIcon}
    >
      <Icon
        icon={LockDottedCircle}
        sx={t => ({ color: t.colors.$primary500 })}
      />
    </Box>
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
