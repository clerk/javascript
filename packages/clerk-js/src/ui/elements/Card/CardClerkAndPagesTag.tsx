import React from 'react';

import { useEnvironment } from '../../contexts';
import { Flex, Icon, Link, Text } from '../../customizables';
import { LogoMark } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { Card } from '.';

export const CardClerkAndPagesTag = React.memo(
  React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Flex> & { withFooterPages?: boolean }>((props, ref) => {
    const { sx, withFooterPages = false, ...rest } = props;
    const { branded } = useEnvironment().displayConfig;

    if (!(branded || withFooterPages)) {
      return null;
    }

    return (
      <Flex
        sx={[
          t => ({
            ':has(div:only-child)': {
              justifyContent: 'center',
            },
            justifyContent: 'space-between',
            width: '100%',
            padding: `0 ${t.space.$8}`,
          }),
          sx,
        ]}
        {...rest}
        ref={ref}
      >
        {branded && (
          <Flex
            gap={1}
            align='center'
            justify='center'
            sx={t => ({ color: t.colors.$textTertiary })}
          >
            <>
              <Text variant='buttonSmall'>Secured by</Text>
              <LogoMarkIconLink />
            </>
          </Flex>
        )}

        {withFooterPages && <Card.FooterLinks />}
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
