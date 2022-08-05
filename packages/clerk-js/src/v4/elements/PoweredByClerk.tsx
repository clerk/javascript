import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { Flex, Icon, Link, Text } from '../customizables';
import { LogoMark } from '../icons';
import { InternalTheme, mqu, PropsOfComponent } from '../styledSystem';

export const PoweredByClerkText = React.memo(() => {
  const { branded } = useEnvironment().displayConfig;

  return branded ? (
    <Flex
      gap={1}
      justify='center'
      sx={theme => ({ color: theme.colors.$blackAlpha300 })}
    >
      <Text
        variant='smallMedium'
        sx={{ color: 'inherit' }}
      >
        Secured by
      </Text>
      <LogoMarkIconLink />
    </Flex>
  ) : null;
});

export const PoweredByClerkTag = React.memo(
  React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Flex>>((props, ref) => {
    const { branded } = useEnvironment().displayConfig;

    const topLeft = (theme: InternalTheme) => ({
      left: '-1px',
      top: theme.radii.$lg,
      bottom: 'unset',
      transform: `rotate(-90deg) translateX(-10rem)`,
      borderRadius: `${theme.radii.$md} ${theme.radii.$md} 0 0`,
      borderTopColor: theme.colors.$whiteAlpha200,
    });

    const bottomLeft = (theme: InternalTheme) => ({
      left: 0,
      top: 'unset',
      bottom: '-1px',
      transform: `translateX(2rem) translateY(100%)`,
      borderRadius: `0 0 ${theme.radii.$md} ${theme.radii.$md}`,
      borderTopColor: 'transparent',
    });

    return branded ? (
      <Flex
        gap={2}
        align='center'
        sx={theme => ({
          border: theme.borders.$normal,
          borderColor: theme.colors.$whiteAlpha200,
          color: theme.colors.$colorTextOnPrimaryBackground,
          backgroundColor: theme.colors.$primary500,
          padding: `${theme.space.$1x5} ${theme.space.$4}`,
          position: 'absolute',
          transformOrigin: 'left bottom',
          ...topLeft(theme),
          [mqu.sm]: {
            ...bottomLeft(theme),
          },
        })}
        {...props}
        ref={ref}
      >
        <Text
          variant='extraSmallRegular'
          sx={theme => ({ color: 'inherit', letterSpacing: theme.space.$none, fontSize: '0.625rem' })}
        >
          Secured by
        </Text>
        <LogoMarkIconLink />
      </Flex>
    ) : null;
  }),
);

const LogoMarkIconLink = () => {
  return (
    <Link
      href='https://www.clerk.dev?utm_source=clerk&utm_medium=components'
      colorScheme='neutral'
      sx={{
        color: 'inherit',
        '&:hover': { color: 'inherit' },
      }}
      isExternal
    >
      <Icon
        icon={LogoMark}
        sx={theme => ({
          width: theme.sizes.$12,
          height: theme.sizes.$3x5,
          transform: 'translateY(1px)',
        })}
      />
    </Link>
  );
};
