import { useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { useEnvironment, useOAuthConsentContext } from '@/ui/contexts';
import { Box, Button, Flow, Grid, localizationKeys, Text, useLocalizations } from '@/ui/customizables';
import { ApplicationLogo } from '@/ui/elements/ApplicationLogo';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { Modal } from '@/ui/elements/Modal';
import { Alert, Textarea } from '@/ui/primitives';
import { InlineAction } from './InlineAction';
import { LogoGroup, LogoGroupItem, LogoGroupIcon, LogoGroupSeparator } from './LogoGroup';
import { OrgSelect } from './OrgSelect';
import {
  ListGroup,
  ListGroupContent,
  ListGroupHeader,
  ListGroupHeaderTitle,
  ListGroupItem,
  ListGroupItemLabel,
} from './ListGroup';

const OFFLINE_ACCESS_SCOPE = 'offline_access';

export function OAuthConsentInternal() {
  const { scopes, oAuthApplicationName, oAuthApplicationLogoUrl, oAuthApplicationUrl, redirectUrl, onDeny, onAllow } =
    useOAuthConsentContext();
  const { user } = useUser();
  const { applicationName, logoImageUrl } = useEnvironment().displayConfig;
  const [isUriModalOpen, setIsUriModalOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>('clerk-nation');

  const selectOptions = [
    { value: 'clerk-nation', label: 'Clerk Nation', logoUrl: 'https://img.clerk.com/static/clerk.png' },
    {
      value: 'perky-clerky',
      label: 'Perky Clerky Clerk Nation Clerk Nation Clerk Nation',
      logoUrl: 'https://img.clerk.com/static/clerk.png',
    },
    { value: 'clerk', label: 'Clerk', logoUrl: 'https://img.clerk.com/static/clerk.png' },
    { value: 'clerk-of-oz', label: 'The Clerk of Oz', logoUrl: 'https://img.clerk.com/static/clerk.png' },
  ];

  const primaryIdentifier = user?.primaryEmailAddress?.emailAddress || user?.primaryPhoneNumber?.phoneNumber;

  // Filter out offline_access from displayed scopes as it doesn't describe what can be accessed
  const displayedScopes = (scopes || []).filter(item => item.scope !== OFFLINE_ACCESS_SCOPE);
  const hasOfflineAccess = (scopes || []).some(item => item.scope === OFFLINE_ACCESS_SCOPE);

  function getRootDomain(): string {
    try {
      const { hostname } = new URL(redirectUrl);
      return hostname.split('.').slice(-2).join('.');
    } catch {
      return 'https://example.com';
    }
  }

  const { t } = useLocalizations();
  const domainAction = getRootDomain();
  const viewFullUrlText = t(localizationKeys('oauthConsent.viewFullUrl'));

  return (
    <Flow.Root flow='oauthConsent'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            {/* both have avatars */}
            {oAuthApplicationLogoUrl && logoImageUrl && (
              <LogoGroup>
                <LogoGroupItem justify='end'>
                  <ApplicationLogo
                    src={oAuthApplicationLogoUrl}
                    alt={oAuthApplicationName}
                    href={oAuthApplicationUrl}
                    isExternal
                  />
                </LogoGroupItem>
                <LogoGroupSeparator />
                <LogoGroupItem justify='start'>
                  <ApplicationLogo />
                </LogoGroupItem>
              </LogoGroup>
            )}
            {/* only OAuth app has an avatar */}
            {oAuthApplicationLogoUrl && !logoImageUrl && (
              <LogoGroup>
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
                  <LogoGroupIcon
                    size='sm'
                    sx={t => ({
                      position: 'absolute',
                      bottom: `calc(${t.space.$3} * -1)`,
                      insetInlineEnd: `calc(${t.space.$3} * -1)`,
                    })}
                  />
                </Box>
              </LogoGroup>
            )}
            {/* only Clerk application has an avatar */}
            {!oAuthApplicationLogoUrl && logoImageUrl && (
              <LogoGroup>
                <LogoGroupItem justify='end'>
                  <LogoGroupIcon />
                </LogoGroupItem>
                <LogoGroupSeparator />
                <LogoGroupItem justify='start'>
                  <ApplicationLogo />
                </LogoGroupItem>
              </LogoGroup>
            )}
            {/* no avatars */}
            {!oAuthApplicationLogoUrl && !logoImageUrl && (
              <LogoGroup>
                <LogoGroupIcon />
              </LogoGroup>
            )}
            <Header.Title localizationKey={oAuthApplicationName} />
            <Header.Subtitle
              localizationKey={localizationKeys('oauthConsent.subtitle', {
                applicationName,
                identifier: primaryIdentifier || '',
              })}
            />
          </Header.Root>

          {selectOptions.length > 0 && (
            <OrgSelect
              options={selectOptions}
              value={selectedValue}
              onChange={setSelectedValue}
            />
          )}

          <ListGroup>
            <ListGroupHeader>
              <ListGroupHeaderTitle
                localizationKey={localizationKeys('oauthConsent.scopeList.title', {
                  applicationName: oAuthApplicationName,
                })}
              />
            </ListGroupHeader>
            <ListGroupContent>
              {displayedScopes.map(item => (
                <ListGroupItem key={item.scope}>
                  <ListGroupItemLabel>{item.description || item.scope || ''}</ListGroupItemLabel>
                </ListGroupItem>
              ))}
            </ListGroupContent>
          </ListGroup>

          <Alert colorScheme='warning'>
            <Text
              colorScheme='warning'
              variant='caption'
            >
              <InlineAction
                text={t(
                  localizationKeys('oauthConsent.warning', {
                    applicationName: oAuthApplicationName || applicationName,
                    domainAction,
                  }),
                )}
                actionText={domainAction}
                onClick={() => setIsUriModalOpen(true)}
                tooltipText={viewFullUrlText}
              />
            </Text>
          </Alert>
          <Grid
            columns={2}
            gap={3}
          >
            <Button
              colorScheme='secondary'
              variant='outline'
              localizationKey={localizationKeys('oauthConsent.action__deny')}
              onClick={onDeny}
            />
            <Button
              localizationKey={localizationKeys('oauthConsent.action__allow')}
              onClick={onAllow}
            />
            <Text
              sx={{
                gridColumn: 'span 2',
              }}
              colorScheme='secondary'
              variant='caption'
            >
              <InlineAction
                text={t(localizationKeys('oauthConsent.redirectNotice', { domainAction }))}
                actionText={domainAction}
                onClick={() => setIsUriModalOpen(true)}
                tooltipText={viewFullUrlText}
              />
              {hasOfflineAccess && t(localizationKeys('oauthConsent.offlineAccessNotice'))}
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
            <Header.Title localizationKey={localizationKeys('oauthConsent.redirectUriModal.title')} />
            <Header.Subtitle
              localizationKey={localizationKeys('oauthConsent.redirectUriModal.subtitle', {
                applicationName: oAuthApplicationName,
              })}
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

export const OAuthConsent = withCardStateProvider(OAuthConsentInternal);
