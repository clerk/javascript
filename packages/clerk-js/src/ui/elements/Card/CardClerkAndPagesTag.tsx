import React from 'react';

import { useEnvironment } from '../../contexts';
import { Col, Flex, Icon, Link, Text } from '../../customizables';
import { LogoMark } from '../../icons';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { DevModeNotice } from '../DevModeNotice';
import { Card } from '.';

export const CardClerkAndPagesTag = React.memo(
  React.forwardRef<
    HTMLDivElement,
    PropsOfComponent<typeof Flex> & {
      withFooterPages?: boolean;
      withDevModeNotice?: boolean;
      devModeNoticeSx?: ThemableCssProp;
    }
  >((props, ref) => {
    const { sx, withFooterPages = false, withDevModeNotice = false, devModeNoticeSx, ...rest } = props;
    const { displayConfig } = useEnvironment();

    if (!(displayConfig.branded || withFooterPages) && !withDevModeNotice) {
      return null;
    }

    return (
      <Col
        sx={t => ({
          gap: t.space.$2,
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
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
          {displayConfig.branded && (
            <Flex
              gap={1}
              align='center'
              justify='center'
              sx={t => ({ color: t.colors.$colorTextSecondary })}
            >
              <>
                <Text variant='buttonSmall'>Secured by</Text>
                <LogoMarkIconLink />
              </>
            </Flex>
          )}

          {withFooterPages && <Card.FooterLinks />}
        </Flex>

        {withDevModeNotice && <DevModeNotice sx={devModeNoticeSx} />}
      </Col>
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
