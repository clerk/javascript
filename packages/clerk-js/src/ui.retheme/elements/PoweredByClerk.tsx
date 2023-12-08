import React from 'react';

import { useEnvironment } from '../contexts';
import { Flex, Icon, Link, Text } from '../customizables';
import { LogoMark } from '../icons';
import type { PropsOfComponent } from '../styledSystem';

export const PoweredByClerkTag = React.memo(
  React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Flex>>((props, ref) => {
    const { sx, ...rest } = props;
    const { branded } = useEnvironment().displayConfig;

    return (
      <Flex
        gap={1}
        align='center'
        justify='center'
        sx={[t => ({ width: '100%', color: t.colors.$colorTextSecondary }), sx]}
        {...rest}
        ref={ref}
      >
        {branded ? (
          <>
            <Text sx={{ color: 'inherit' }}>Secured by</Text>
            <LogoMarkIconLink />
          </>
        ) : null}
      </Flex>
    );
  }),
);

const LogoMarkIconLink = () => {
  return (
    <Link
      href='https://www.clerk.com?utm_source=clerk&utm_medium=components'
      colorScheme='neutral'
      sx={{
        color: 'inherit',
        '&:hover': { color: 'inherit' },
      }}
      isExternal
      aria-label='Clerk logo'
    >
      <Icon
        icon={LogoMark}
        sx={theme => ({
          width: theme.sizes.$12,
          height: theme.sizes.$3x5,
        })}
      />
    </Link>
  );
};
