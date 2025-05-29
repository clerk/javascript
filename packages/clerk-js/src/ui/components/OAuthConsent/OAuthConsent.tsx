import { useUser } from '@clerk/shared/react';

import { useEnvironment, useOAuthConsentContext } from '../../contexts';
import { Box, Button, Flex, Flow, Grid, Icon, Text } from '../../customizables';
import { ApplicationLogo, Avatar, Card, Header, Tooltip, withCardStateProvider } from '../../elements';
import { Connections } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common } from '../../styledSystem';
import { colors } from '../../utils';

export function OAuthConsentInternal() {
  const { scopes, oAuthApplicationName, oAuthApplicationLogoUrl, redirectUrl, onDeny, onAllow } =
    useOAuthConsentContext();
  const { user } = useUser();
  const { applicationName, logoImageUrl } = useEnvironment().displayConfig;

  const { hostname: redirectUrlHostname } = new URL(redirectUrl);

  const primaryEmailAddress = user?.emailAddresses.find(email => email.id === user.primaryEmailAddress?.id);

  return (
    <Flow.Root flow='oauthConsent'>
      <Card.Root>
        <Card.Content>
          <Box
            sx={t => ({
              marginBlockStart: `calc(${t.space.$8} * -1)`,
              marginInline: `calc(${t.space.$10} * -1)`,
              backgroundImage: `linear-gradient(to bottom, ${t.colors.$warningAlpha200}, transparent)`,
              paddingBlockStart: t.space.$4,
              paddingInline: t.space.$10,
            })}
          >
            <Text
              colorScheme='warning'
              variant='caption'
            >
              Make sure that you trust {oAuthApplicationName} {''}
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <Text
                    as='span'
                    variant='caption'
                    sx={{
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'inline-block',
                    }}
                  >
                    {redirectUrlHostname}
                  </Text>
                </Tooltip.Trigger>
                <Tooltip.Content
                  text={redirectUrl}
                  sx={{ wordBreak: 'break-all' }}
                />
              </Tooltip.Root>
              {''}. You may be sharing sensitive data with this site or app.
            </Text>
          </Box>
          <Header.Root>
            {/* both have avatars */}
            {oAuthApplicationLogoUrl && logoImageUrl && (
              <ConnectionHeader>
                <Avatar
                  imageUrl={oAuthApplicationLogoUrl}
                  size={t => t.space.$12}
                  rounded={false}
                />
                <ConnectionSeparator />
                <ApplicationLogo />
              </ConnectionHeader>
            )}
            {/* only OAuth app has an avatar */}
            {oAuthApplicationLogoUrl && !logoImageUrl && (
              <ConnectionHeader>
                <Box
                  sx={{
                    position: 'relative',
                  }}
                >
                  <Avatar
                    imageUrl={oAuthApplicationLogoUrl}
                    size={t => t.space.$12}
                    rounded={false}
                  />
                  <ConnectionIcon
                    size='sm'
                    sx={t => ({
                      position: 'absolute',
                      bottom: `calc(${t.space.$3} * -1)`,
                      right: `calc(${t.space.$3} * -1)`,
                    })}
                  />
                </Box>
              </ConnectionHeader>
            )}
            {/* only Clerk application has an avatar */}
            {!oAuthApplicationLogoUrl && logoImageUrl && (
              <Flex
                justify='center'
                align='center'
                gap={4}
                sx={t => ({
                  marginBlockEnd: t.space.$6,
                })}
              >
                <ConnectionIcon />
                <ConnectionSeparator />
                <ApplicationLogo />
              </Flex>
            )}
            {/* no avatars */}
            {!oAuthApplicationLogoUrl && !logoImageUrl && (
              <Flex
                justify='center'
                align='center'
                gap={4}
                sx={t => ({
                  marginBlockEnd: t.space.$6,
                })}
              >
                <ConnectionIcon />
              </Flex>
            )}
            <Header.Title localizationKey={oAuthApplicationName} />
            <Header.Subtitle
              localizationKey={`wants to access to ${applicationName} on behalf of ${primaryEmailAddress}`}
            />
          </Header.Root>
          <Box
            sx={t => ({
              textAlign: 'left',
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$neutralAlpha100,
              borderRadius: t.radii.$lg,
              overflow: 'hidden',
            })}
          >
            <Box
              sx={t => ({
                padding: t.space.$3,
                background: common.mergedColorsBackground(
                  colors.setAlpha(t.colors.$colorBackground, 1),
                  t.colors.$neutralAlpha50,
                ),
              })}
            >
              <Text
                variant='subtitle'
                localizationKey='This app wants to access your account'
              />
            </Box>
            <Box
              as='ul'
              sx={t => ({ margin: t.sizes.$none, padding: t.sizes.$none })}
            >
              {(scopes || []).map(item => (
                <Box
                  key={item.scope}
                  sx={t => ({
                    display: 'flex',
                    alignItems: 'baseline',
                    paddingInline: t.space.$3,
                    paddingBlock: t.space.$2,
                    borderTopWidth: t.borderWidths.$normal,
                    borderTopStyle: t.borderStyles.$solid,
                    borderTopColor: t.colors.$neutralAlpha100,
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: t.space.$1,
                      height: t.space.$1,
                      background: t.colors.$colorTextSecondary,
                      borderRadius: t.radii.$circle,
                      transform: 'translateY(-0.1875rem)',
                      marginRight: t.space.$2,
                      flexShrink: 0,
                    },
                  })}
                  as='li'
                >
                  <Text
                    variant='subtitle'
                    localizationKey={item.description || ''}
                  />
                </Box>
              ))}
            </Box>
          </Box>
          <Grid
            columns={2}
            gap={3}
          >
            <Button
              colorScheme='secondary'
              variant='outline'
              localizationKey='Deny'
              onClick={onDeny}
            />
            <Button
              localizationKey='Allow'
              onClick={onAllow}
            />
            <Text
              sx={{
                gridColumn: 'span 2',
              }}
              colorScheme='secondary'
              variant='caption'
            >
              If you allow access, this app will redirect you to{' '}
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <Text
                    as='span'
                    variant='caption'
                    sx={{
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'inline-block',
                    }}
                  >
                    {redirectUrlHostname}
                  </Text>
                </Tooltip.Trigger>
                <Tooltip.Content
                  text={redirectUrl}
                  sx={{ wordBreak: 'break-all' }}
                />
              </Tooltip.Root>
            </Text>
          </Grid>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Root>
  );
}

function ConnectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      justify='center'
      align='center'
      gap={4}
      sx={t => ({
        marginBlockEnd: t.space.$6,
      })}
    >
      {children}
    </Flex>
  );
}

function ConnectionIcon({ size = 'md', sx }: { size?: 'sm' | 'md'; sx?: ThemableCssProp }) {
  const scale: ThemableCssProp = t => {
    const value = size === 'sm' ? t.space.$6 : t.space.$12;
    return {
      width: value,
      height: value,
    };
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
          borderColor: t.colors.$neutralAlpha100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        scale,
        sx,
      ]}
    >
      <Icon
        icon={Connections}
        sx={t => ({
          color: t.colors.$primary500,
        })}
      />
    </Box>
  );
}

function ConnectionSeparator() {
  return (
    <Box
      as='svg'
      // @ts-ignore - valid SVG attribute
      fill='none'
      viewBox='0 0 16 2'
      height={2}
      aria-hidden
      sx={t => ({
        color: t.colors.$colorTextSecondary,
      })}
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

export const OAuthConsent = withCardStateProvider(OAuthConsentInternal);
