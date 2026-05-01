import { useClerk, useOAuthConsent, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { useEnvironment, useOAuthConsentContext, withCoreUserGuard } from '@/ui/contexts';
import { Box, Button, Flow, Grid, localizationKeys, Text, useLocalizations } from '@/ui/customizables';
import { ApplicationLogo } from '@/ui/elements/ApplicationLogo';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';
import { Modal } from '@/ui/elements/Modal';
import { Alert, Textarea } from '@/ui/primitives';
import { Route, Switch } from '@/ui/router';

import { InlineAction } from './InlineAction';
import {
  ListGroup,
  ListGroupContent,
  ListGroupHeader,
  ListGroupHeaderTitle,
  ListGroupItem,
  ListGroupItemLabel,
} from './ListGroup';
import { LogoGroup, LogoGroupIcon, LogoGroupItem, LogoGroupSeparator } from './LogoGroup';
import { OrgSelect } from './OrgSelect';
import { getForwardedParams, getOAuthConsentFromSearch, getRedirectDisplay, getRedirectUriFromSearch } from './utils';

const OFFLINE_ACCESS_SCOPE = 'offline_access';
const USER_ORG_READ_SCOPE = 'user:org:read';

function _OAuthConsent() {
  const ctx = useOAuthConsentContext();
  const clerk = useClerk();
  const { user } = useUser();
  const {
    displayConfig: { applicationName, logoImageUrl },
    organizationSettings,
  } = useEnvironment();
  const [isUriModalOpen, setIsUriModalOpen] = useState(false);

  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  // onAllow and onDeny are always provided as a pair by the accounts portal.
  const hasContextCallbacks = Boolean(ctx.onAllow || ctx.onDeny);

  // Resolve oauthClientId and scope once: context overrides URL fallback.
  const fromUrl = getOAuthConsentFromSearch();
  const oauthClientId = ctx.oauthClientId ?? fromUrl.oauthClientId;
  const scope = ctx.scope ?? fromUrl.scope;

  // Public path: fetch via hook. Disabled on the accounts portal path
  // (which already has all data via context) to avoid a wasted FAPI request.
  const { data, isLoading, error } = useOAuthConsent({
    oauthClientId,
    scope,
    // TODO: Remove this once account portal is refactored to use this component
    enabled: !hasContextCallbacks,
  });

  // Hook returns camelCase `requiresConsent`; the render logic uses snake_case.
  const mappedHookScopes = data?.scopes?.map(s => ({
    scope: s.scope,
    description: s.description,
    requires_consent: s.requiresConsent,
  }));

  // Context (accounts portal path) wins over hook data (public path).
  const scopes = ctx.scopes ?? mappedHookScopes ?? [];
  const oauthApplicationName = ctx.oauthApplicationName ?? data?.oauthApplicationName ?? '';
  const oauthApplicationLogoUrl = ctx.oauthApplicationLogoUrl ?? data?.oauthApplicationLogoUrl;
  const oauthApplicationUrl = ctx.oauthApplicationUrl ?? data?.oauthApplicationUrl;
  const redirectUrl = ctx.redirectUrl ?? getRedirectUriFromSearch();

  const hasOrgReadScope = scopes.some(s => s.scope === USER_ORG_READ_SCOPE);
  const orgSelectionEnabled = !!((hasOrgReadScope || ctx.enableOrgSelection) && organizationSettings.enabled);
  const orgOptions = orgSelectionEnabled
    ? (user?.organizationMemberships ?? []).map(m => ({
        value: m.organization.id,
        label: m.organization.name,
        logoUrl: m.organization.imageUrl,
      }))
    : [];
  const lastActiveOrgId = clerk.session?.lastActiveOrganizationId;
  const defaultOrg = orgOptions.find(o => o.value === lastActiveOrgId)?.value ?? orgOptions[0]?.value ?? null;
  const effectiveOrg = selectedOrg ?? defaultOrg;

  const { t } = useLocalizations();
  const domainAction = getRedirectDisplay(redirectUrl);
  const viewFullUrlText = t(localizationKeys('oauthConsent.viewFullUrl'));

  // Error states only apply to the public flow.
  if (!hasContextCallbacks) {
    const errorMessage = !oauthClientId
      ? 'The client ID is missing.'
      : !redirectUrl
        ? 'The redirect URI is missing.'
        : error
          ? (error.message ?? 'Failed to load consent information.')
          : undefined;

    if (errorMessage) {
      return (
        <Card.Root>
          <Card.Content>
            <Card.Alert>{errorMessage}</Card.Alert>
          </Card.Content>
          <Card.Footer />
        </Card.Root>
      );
    }

    if (isLoading) {
      return (
        <Card.Root>
          <Card.Content>
            <LoadingCardContainer />
          </Card.Content>
          <Card.Footer />
        </Card.Root>
      );
    }
  }

  const actionUrl = clerk.oauthApplication.buildConsentActionUrl({ clientId: oauthClientId });
  const forwardedParams = getForwardedParams();

  // Accounts portal path delegates to context callbacks; public path lets the form submit natively.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!hasContextCallbacks) {
      return;
    }
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value === 'true') {
      ctx.onAllow?.();
    } else {
      ctx.onDeny?.();
    }
  };

  const primaryIdentifier = user?.primaryEmailAddress?.emailAddress || user?.primaryPhoneNumber?.phoneNumber;

  const displayedScopes = scopes.filter(item => ![OFFLINE_ACCESS_SCOPE, USER_ORG_READ_SCOPE].includes(item.scope));
  const hasOfflineAccess = scopes.some(item => item.scope === OFFLINE_ACCESS_SCOPE);

  return (
    <>
      <form
        method='POST'
        action={actionUrl}
        onSubmit={handleSubmit}
      >
        <Card.Root>
          <Card.Content>
            <Header.Root>
              {/* both have avatars */}
              {oauthApplicationLogoUrl && logoImageUrl && (
                <LogoGroup>
                  <LogoGroupItem justify='end'>
                    <ApplicationLogo
                      src={oauthApplicationLogoUrl}
                      alt={oauthApplicationName}
                      href={oauthApplicationUrl}
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
              {oauthApplicationLogoUrl && !logoImageUrl && (
                <LogoGroup>
                  <Box sx={{ position: 'relative' }}>
                    <ApplicationLogo
                      src={oauthApplicationLogoUrl}
                      alt={oauthApplicationName}
                      href={oauthApplicationUrl}
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
              {!oauthApplicationLogoUrl && logoImageUrl && (
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
              {!oauthApplicationLogoUrl && !logoImageUrl && (
                <LogoGroup>
                  <LogoGroupIcon />
                </LogoGroup>
              )}
              <Header.Title localizationKey={oauthApplicationName} />
              <Header.Subtitle
                localizationKey={localizationKeys('oauthConsent.subtitle', {
                  applicationName,
                  identifier: primaryIdentifier || '',
                })}
              />
            </Header.Root>
            {orgSelectionEnabled && orgOptions.length > 0 && effectiveOrg && (
              <OrgSelect
                options={orgOptions}
                value={effectiveOrg}
                onChange={setSelectedOrg}
              />
            )}
            <ListGroup>
              <ListGroupHeader>
                <ListGroupHeaderTitle
                  localizationKey={localizationKeys('oauthConsent.scopeList.title', {
                    applicationName: oauthApplicationName,
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
                      applicationName: oauthApplicationName || applicationName,
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
                type='submit'
                name='consented'
                value='false'
                colorScheme='secondary'
                variant='outline'
                localizationKey={localizationKeys('oauthConsent.action__deny')}
              />
              <Button
                type='submit'
                name='consented'
                value='true'
                localizationKey={localizationKeys('oauthConsent.action__allow')}
              />
              <Text
                sx={{ gridColumn: 'span 2' }}
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
        {!hasContextCallbacks &&
          forwardedParams.map(([key, value]) => (
            <input
              key={key}
              type='hidden'
              name={key}
              value={value}
            />
          ))}
        {!hasContextCallbacks && orgSelectionEnabled && effectiveOrg && (
          <input
            type='hidden'
            name='organization_id'
            value={effectiveOrg}
          />
        )}
      </form>
      <RedirectUriModal
        isOpen={isUriModalOpen}
        onOpen={() => setIsUriModalOpen(true)}
        onClose={() => setIsUriModalOpen(false)}
        redirectUri={redirectUrl}
        oauthApplicationName={oauthApplicationName}
      />
    </>
  );
}

type RedirectUriModalProps = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  redirectUri: string;
  oauthApplicationName: string;
};

function RedirectUriModal({ onOpen, onClose, isOpen, redirectUri, oauthApplicationName }: RedirectUriModalProps) {
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
                applicationName: oauthApplicationName,
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

const AuthenticatedRoutes = withCoreUserGuard(withCardStateProvider(_OAuthConsent));

const OAuthConsentInternal = () => {
  return (
    <Flow.Root flow='oauthConsent'>
      <Flow.Part>
        <Switch>
          <Route>
            <AuthenticatedRoutes />
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

export const OAuthConsent = OAuthConsentInternal;
