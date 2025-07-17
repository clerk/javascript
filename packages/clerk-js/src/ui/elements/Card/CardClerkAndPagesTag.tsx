import React from 'react';

import { useEnvironment } from '../../contexts';
import { Box, Col, Flex, Icon, Link, Text } from '../../customizables';
import { useDevMode } from '../../hooks/useDevMode';
import { LogoMark } from '../../icons';
import type { PropsOfComponent, ThemableCssProp } from '../../styledSystem';
import { DevModeNotice, DevModeOverlay } from '../DevModeNotice';
import { Card } from '.';

export const CardClerkAndPagesTag = React.memo(
  React.forwardRef<
    HTMLDivElement,
    PropsOfComponent<typeof Flex> & {
      withFooterPages?: boolean;
      devModeNoticeSx?: ThemableCssProp;
      outerSx?: ThemableCssProp;
      withDevOverlay?: boolean;
    }
  >((props, ref) => {
    const { sx, outerSx, withFooterPages = false, withDevOverlay = false, devModeNoticeSx, ...rest } = props;
    const { displayConfig } = useEnvironment();
    const { showDevModeNotice } = useDevMode();

    if (!(displayConfig.branded || withFooterPages) && !showDevModeNotice) {
      return null;
    }

    return (
      <Box
        sx={[
          {
            width: '100%',
            position: 'relative',
            isolation: 'isolate',
          },
          outerSx,
        ]}
      >
        {withDevOverlay && <DevModeOverlay gradient={0} />}
        <Col
          sx={t => ({
            gap: displayConfig.branded || withFooterPages ? t.space.$2 : 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
            position: 'relative',
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
                  sx={t => ({ color: t.colors.$colorMutedForeground })}
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
      </Box>
    );
  }),
);

const LogoMarkIconLink = () => {
  return (
    <Link
      href='https://go.clerk.com/components'
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
