import { useUser } from '@clerk/shared/react';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import { useEnvironment, useOAuthConsentContext } from '@/ui/contexts';
import { Box, Button, Flex, Flow, Grid, Icon, Text } from '@/ui/customizables';
import { ApplicationLogo } from '@/ui/elements/ApplicationLogo';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { Modal } from '@/ui/elements/Modal';
import { Tooltip } from '@/ui/elements/Tooltip';
import { LockDottedCircle } from '@/ui/icons';
import { Alert, Textarea } from '@/ui/primitives';
import type { ThemableCssProp } from '@/ui/styledSystem';
import { common } from '@/ui/styledSystem';
import { colors } from '@/ui/utils/colors';

const OFFLINE_ACCESS_SCOPE = 'offline_access';

export function OAuthConsentInternal() {
  const { scopes, oAuthApplicationName, oAuthApplicationLogoUrl, oAuthApplicationUrl, redirectUrl, onDeny, onAllow } =
    useOAuthConsentContext();
  const { user } = useUser();
  const { applicationName, logoImageUrl } = useEnvironment().displayConfig;
  const [isUriModalOpen, setIsUriModalOpen] = useState(false);

  const primaryIdentifier = user?.primaryEmailAddress?.emailAddress || user?.primaryPhoneNumber?.phoneNumber;

  // Filter out offline_access from displayed scopes as it doesn't describe what can be accessed
  const displayedScopes = (scopes || []).filter(item => item.scope !== OFFLINE_ACCESS_SCOPE);
  const hasOfflineAccess = (scopes || []).some(item => item.scope === OFFLINE_ACCESS_SCOPE);

  function getRootDomain(): string {
    try {
      const { hostname } = new URL(redirectUrl);
      return hostname.split('.').slice(-2).join('.');
    } catch {
      return '';
    }
  }

  return (
    <Flow.Root flow='oauthConsent'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            {/* both have avatars */}
            {oAuthApplicationLogoUrl && logoImageUrl && (
              <ConnectionHeader>
                <ConnectionItem justify='end'>
                  <ApplicationLogo
                    src={oAuthApplicationLogoUrl}
                    alt={oAuthApplicationName}
                    href={oAuthApplicationUrl}
                    isExternal
                  />
                </ConnectionItem>
                <ConnectionSeparator />
                <ConnectionItem justify='start'>
                  <ApplicationLogo />
                </ConnectionItem>
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
                  <ApplicationLogo
                    src={oAuthApplicationLogoUrl}
                    alt={oAuthApplicationName}
                    href={oAuthApplicationUrl}
                    isExternal
                  />
                  <ConnectionIcon
                    size='sm'
                    sx={t => ({
                      position: 'absolute',
                      bottom: `calc(${t.space.$3} * -1)`,
                      insetInlineEnd: `calc(${t.space.$3} * -1)`,
                    })}
                  />
                </Box>
              </ConnectionHeader>
            )}
            {/* only Clerk application has an avatar */}
            {!oAuthApplicationLogoUrl && logoImageUrl && (
              <ConnectionHeader>
                <ConnectionItem justify='end'>
                  <ConnectionIcon />
                </ConnectionItem>
                <ConnectionSeparator />
                <ConnectionItem justify='start'>
                  <ApplicationLogo />
                </ConnectionItem>
              </ConnectionHeader>
            )}
            {/* no avatars */}
            {!oAuthApplicationLogoUrl && !logoImageUrl && (
              <ConnectionHeader>
                <ConnectionIcon />
              </ConnectionHeader>
            )}
            <Header.Title localizationKey={oAuthApplicationName} />
            <Header.Subtitle localizationKey={`wants to access ${applicationName} on behalf of ${primaryIdentifier}`} />
          </Header.Root>
          <Box
            sx={t => ({
              textAlign: 'start',
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$borderAlpha100,
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
                localizationKey={`This will allow ${oAuthApplicationName} access to:`}
              />
            </Box>
            <Box
              as='ul'
              sx={t => ({ margin: t.sizes.$none, padding: t.sizes.$none })}
            >
              {displayedScopes.map(item => (
                <Box
                  key={item.scope}
                  sx={t => ({
                    display: 'flex',
                    alignItems: 'baseline',
                    paddingInline: t.space.$3,
                    paddingBlock: t.space.$2,
                    borderTopWidth: t.borderWidths.$normal,
                    borderTopStyle: t.borderStyles.$solid,
                    borderTopColor: t.colors.$borderAlpha100,
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: t.space.$1,
                      height: t.space.$1,
                      background: t.colors.$colorMutedForeground,
                      borderRadius: t.radii.$circle,
                      transform: 'translateY(-0.1875rem)',
                      marginInlineEnd: t.space.$2,
                      flexShrink: 0,
                    },
                  })}
                  as='li'
                >
                  <Text
                    variant='subtitle'
                    localizationKey={item.description || item.scope || ''}
                  />
                </Box>
              ))}
            </Box>
          </Box>
          <Alert colorScheme='warning'>
            <Text
              colorScheme='warning'
              variant='caption'
            >
              Make sure that you trust {oAuthApplicationName} {''}
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <Text
                    as='span'
                    role='button'
                    tabIndex={0}
                    aria-label='View full URL'
                    variant='caption'
                    sx={{
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'inline-block',
                    }}
                    onClick={() => setIsUriModalOpen(true)}
                  >
                    ({getRootDomain()})
                  </Text>
                </Tooltip.Trigger>
                <Tooltip.Content text={`View full URL`} />
              </Tooltip.Root>
              {''}. You may be sharing sensitive data with this site or app.
            </Text>
          </Alert>
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
                    role='button'
                    tabIndex={0}
                    aria-label='View full URL'
                    variant='caption'
                    sx={{
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'inline-block',
                    }}
                    onClick={() => setIsUriModalOpen(true)}
                  >
                    {getRootDomain()}
                  </Text>
                </Tooltip.Trigger>
                <Tooltip.Content text={`View full URL`} />
              </Tooltip.Root>
              .{hasOfflineAccess && " You'll stay signed in until you sign out or revoke access."}
            </Text>
          </Grid>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
      <RedirectUriModal
        isOpen={isUriModalOpen}
        onOpen={() => setIsUriModalOpen(true)}
        onClose={() => setIsUriModalOpen(false)}
        redirectUri={redirectUrl}
        oAuthApplicationName={oAuthApplicationName}
      />
    </Flow.Root>
  );
}

type RedirectUriModalProps = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  redirectUri: string;
  oAuthApplicationName: string;
};

function RedirectUriModal({ onOpen, onClose, isOpen, redirectUri, oAuthApplicationName }: RedirectUriModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      handleOpen={onOpen}
      handleClose={onClose}
    >
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={`Redirect URL`} />
            <Header.Subtitle
              localizationKey={`Make sure you trust ${oAuthApplicationName} and that this URL belongs to ${oAuthApplicationName}.`}
            />
          </Header.Root>
          <Textarea
            style={{ maxHeight: 'none' }}
            cols={50}
            rows={6}
            defaultValue={redirectUri}
            readOnly
          />
        </Card.Content>
      </Card.Root>
    </Modal>
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

function ConnectionItem({ children, sx, ...props }: ComponentProps<typeof Flex>) {
  return (
    <Flex
      {...props}
      sx={[{ flex: 1 }, sx]}
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
          borderColor: t.colors.$borderAlpha100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        scale,
        sx,
      ]}
    >
      <Icon
        icon={LockDottedCircle}
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
        color: t.colors.$colorMutedForeground,
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
