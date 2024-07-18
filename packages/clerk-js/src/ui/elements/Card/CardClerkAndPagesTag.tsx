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
      devModeNoticeSx?: ThemableCssProp;
    }
  >((props, ref) => {
    const { sx, withFooterPages = false, devModeNoticeSx, ...rest } = props;
    const { displayConfig, isDevelopmentOrStaging } = useEnvironment();
    const withDevModeNotice = isDevelopmentOrStaging();

    if (!(displayConfig.branded || withFooterPages) && !withDevModeNotice) {
      return null;
    }

    return (
      <Col
        sx={t => ({
          gap: displayConfig.branded || withFooterPages ? t.space.$2 : 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
        {(displayConfig.branded || withFooterPages) && (
          <Flex
            sx={[
              {
                ':has(div:only-child)': {
                  justifyContent: 'center',
                },
                justifyContent: 'space-between',
                width: '100%',
              },
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
        )}

        <DevModeNotice sx={devModeNoticeSx} />
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
