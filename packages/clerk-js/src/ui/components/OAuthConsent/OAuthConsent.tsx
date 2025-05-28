import { Box, Button, Flex, Flow, Grid, Icon, Text } from '../../customizables';
import { ApplicationLogo, Card, Header, withCardStateProvider } from '../../elements';
import { Connections } from '../../icons';
import type { ThemableCssProp } from '../../styledSystem';
import { common } from '../../styledSystem';
import { colors } from '../../utils';

export function OAuthConsentInternal() {
  return (
    <Flow.Root flow='oauthConsent'>
      <Card.Root>
        <Card.Content>
          <Box
            sx={t => ({
              marginBlockStart: `calc(${t.space.$8} * -1)`,
              marginInline: `calc(${t.space.$10} * -1)`,
              backgroundImage: `linear-gradient(to bottom, ${t.colors.$warningAlpha200}, transparent)`,
              paddingBlock: t.space.$4,
              paddingInline: t.space.$10,
            })}
          >
            <Text
              colorScheme='warning'
              variant='caption'
              localizationKey='Make sure that you trust Test app name {url}. You may be sharing sensitive data with this site or app.'
            />
          </Box>
          <Header.Root>
            {/* both have avatars */}
            <Flex
              justify='center'
              align='center'
              gap={4}
              sx={t => ({
                marginBlockEnd: t.space.$6,
              })}
            >
              <ApplicationLogo />
              <ConnectionSeparator />
              <ApplicationLogo />
            </Flex>
            {/* only OAuth app has an avatar */}
            <Flex
              justify='center'
              align='center'
              gap={4}
              sx={t => ({
                marginBlockEnd: t.space.$6,
              })}
            >
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                <ApplicationLogo />
                <ConnectionIcon
                  size='sm'
                  sx={t => ({
                    position: 'absolute',
                    bottom: `calc(${t.space.$3} * -1)`,
                    right: `calc(${t.space.$3} * -1)`,
                  })}
                />
              </Box>
            </Flex>
            {/* only Clerk application has an avatar */}
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
            {/* no avatars */}
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
            <Header.Title localizationKey='Test app name' />
            <Header.Subtitle localizationKey='wants to access to {yourApp} on behalf of {email}' />
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
            <Box as='ul'>
              {['Email address', 'Profile', 'Phone number'].map(item => (
                <Box
                  key={item}
                  sx={t => ({
                    display: 'flex',
                    alignItems: 'center',
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
                      marginRight: t.space.$2,
                    },
                  })}
                  as='li'
                >
                  <Text
                    variant='subtitle'
                    localizationKey={item}
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
            />
            <Button localizationKey='Allow' />
            <Text
              sx={{
                gridColumn: 'span 2',
              }}
              colorScheme='secondary'
              variant='caption'
              localizationKey='If you allow access, this app will redirect you to
{url}'
            />
          </Grid>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Root>
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
