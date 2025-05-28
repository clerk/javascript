import { Box, Button, Flow, Grid, Text } from '../../customizables';
import { Card, Header, withCardStateProvider } from '../../elements';
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

export const OAuthConsent = withCardStateProvider(OAuthConsentInternal);
