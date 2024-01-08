import React from 'react';

import { useEnvironment } from '../contexts';
import { Flex, Icon, Link, Text } from '../customizables';
import { LogoMark } from '../icons';
import type { PropsOfComponent } from '../styledSystem';

export const PoweredByClerkTag = React.memo(
  React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Flex>>((props, ref) => {
    const { sx, ...rest } = props;
    const { branded } = useEnvironment().displayConfig;

    if (!branded) {
      return null;
    }

    return (
      <Flex
        gap={1}
        align='center'
        justify='center'
        sx={[t => ({ width: '100%', color: t.colors.$blackAlpha500 }), sx]}
        {...rest}
        ref={ref}
      >
        <Text variant='buttonSmall'>Secured by</Text>
        <LogoMarkIconLink />
      </Flex>
    );
  }),
);

const LogoMarkIconLink = () => {
  return (
    <Link
      href='https://www.clerk.com?utm_source=clerk&utm_medium=components'
      colorScheme='inherit'
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
