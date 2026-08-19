import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOAuthDeviceVerification, useUser } from '@clerk/shared/react';
import type { OAuthDeviceVerificationInfo } from '@clerk/shared/types';
import type { FormEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEnvironment, withCoreUserGuard } from '@/ui/contexts';
import { Button, Col, Flow, Grid, Image, localizationKeys, Text, useLocalizations } from '@/ui/customizables';
import { ApplicationLogo } from '@/ui/elements/ApplicationLogo';
import { Card } from '@/ui/elements/Card';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';
import { Alert } from '@/ui/primitives';
import { Route, Switch } from '@/ui/router';
import { useFormControl } from '@/ui/utils/useFormControl';

import {
  ListGroup,
  ListGroupContent,
  ListGroupHeader,
  ListGroupHeaderTitle,
  ListGroupItem,
  ListGroupItemLabel,
} from '../OAuthConsent/ListGroup';
import {
  LogoGroup,
  LogoGroupIcon,
  LogoGroupItem,
  LogoGroupItemContainer,
  LogoGroupSeparator,
} from '../OAuthConsent/LogoGroup';
import { OrgSelect } from '../OAuthConsent/OrgSelect';
import { OAuthDeviceVerificationCodeInput } from './OAuthDeviceVerificationCodeInput';
import { getOAuthDeviceUserCodeFromSearch, isValidOAuthDeviceUserCode, normalizeOAuthDeviceUserCode } from './utils';

const USER_ORG_READ_SCOPE = 'user:org:read';
const OFFLINE_ACCESS_SCOPE = 'offline_access';
const PRIVATE_METADATA_SCOPE = 'private_metadata';

type View =
  | 'entry'
  | 'loading'
  | 'confirmation'
  | 'approved'
  | 'alreadyApproved'
  | 'denied'
  | 'alreadyDenied'
  | 'consumed'
  | 'expired'
  | 'rateLimited'
  | 'alreadyDecided'
  | 'error';

function getErrorCode(error: unknown): string | undefined {
  return isClerkAPIResponseError(error) ? error.errors?.[0]?.code : undefined;
}

function OAuthDeviceVerificationInternal() {
  const clerk = useClerk();
  const { user } = useUser();
  const {
    displayConfig: { applicationName, logoImageUrl },
    organizationSettings,
  } = useEnvironment();
  const { t } = useLocalizations();
  const verification = useOAuthDeviceVerification();
  const [view, setView] = useState<View>('entry');
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [submittingDecision, setSubmittingDecision] = useState<'approve' | 'deny' | null>(null);
  const handledPrefill = useRef(false);

  const codeControl = useFormControl('userCode', '', {
    type: 'text',
    label: localizationKeys('oauthDeviceVerification.start.userCodeLabel'),
    transformer: normalizeOAuthDeviceUserCode,
    isRequired: true,
  });

  const showLookupError = useCallback(
    (error: unknown) => {
      switch (getErrorCode(error)) {
        case 'resource_not_found':
          setView('entry');
          codeControl.setError(t(localizationKeys('oauthDeviceVerification.error.unknownCode')));
          break;
        case 'oauth_device_code_expired':
          setView('expired');
          break;
        case 'too_many_requests':
          setView('rateLimited');
          break;
        default:
          setView('error');
      }
    },
    [codeControl, t],
  );

  const showLookupResult = useCallback((info: OAuthDeviceVerificationInfo) => {
    switch (info.status) {
      case 'pending':
        setView('confirmation');
        break;
      case 'approved':
        setView('alreadyApproved');
        break;
      case 'denied':
        setView('alreadyDenied');
        break;
      case 'consumed':
        setView('consumed');
        break;
      default:
        setView('error');
    }
  }, []);

  const lookup = useCallback(
    async (userCode: string) => {
      codeControl.clearFeedback();
      setView('loading');
      try {
        const info = await verification.lookup({ userCode });
        showLookupResult(info);
      } catch (error) {
        showLookupError(error);
      }
    },
    [codeControl, showLookupError, showLookupResult, verification],
  );

  useEffect(() => {
    if (handledPrefill.current) {
      return;
    }
    handledPrefill.current = true;

    const userCode = getOAuthDeviceUserCodeFromSearch();
    if (!userCode) {
      return;
    }

    codeControl.setValue(normalizeOAuthDeviceUserCode(userCode));
    if (!isValidOAuthDeviceUserCode(userCode)) {
      codeControl.setError(t(localizationKeys('oauthDeviceVerification.error.invalidCode')));
      return;
    }

    void lookup(normalizeOAuthDeviceUserCode(userCode));
  }, [codeControl, lookup, t]);

  const handleLookup: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    const userCode = normalizeOAuthDeviceUserCode(codeControl.value);
    if (!isValidOAuthDeviceUserCode(userCode)) {
      codeControl.setError(t(localizationKeys('oauthDeviceVerification.error.invalidCode')));
      return;
    }
    void lookup(userCode);
  };

  const data = verification.data;
  const hasOrgReadScope = data?.scopes.some(scope => scope.scope === USER_ORG_READ_SCOPE) ?? false;
  const orgSelectionEnabled = hasOrgReadScope && organizationSettings.enabled;
  const orgOptions = orgSelectionEnabled
    ? (user?.organizationMemberships ?? []).map(membership => ({
        value: membership.organization.id,
        label: membership.organization.name,
        logoUrl: membership.organization.imageUrl,
      }))
    : [];
  const lastActiveOrgId = clerk.session?.lastActiveOrganizationId;
  const defaultOrg = orgOptions.find(option => option.value === lastActiveOrgId)?.value ?? orgOptions[0]?.value ?? null;
  const effectiveOrg = selectedOrg ?? defaultOrg;

  const showDecisionError = (error: unknown) => {
    switch (getErrorCode(error)) {
      case 'oauth_device_code_expired':
        setView('expired');
        break;
      case 'too_many_requests':
        setView('rateLimited');
        break;
      case 'bad_request':
        setView('alreadyDecided');
        break;
      default:
        setView('error');
    }
  };

  const handleApprove = async () => {
    const userCode = normalizeOAuthDeviceUserCode(codeControl.value);
    setSubmittingDecision('approve');
    try {
      await verification.approve({ userCode, organizationId: effectiveOrg ?? undefined });
      setView('approved');
    } catch (error) {
      showDecisionError(error);
    } finally {
      setSubmittingDecision(null);
    }
  };

  const handleDeny = async () => {
    const userCode = normalizeOAuthDeviceUserCode(codeControl.value);
    setSubmittingDecision('deny');
    try {
      await verification.deny({ userCode });
      setView('denied');
    } catch (error) {
      showDecisionError(error);
    } finally {
      setSubmittingDecision(null);
    }
  };

  const reset = () => {
    verification.reset();
    codeControl.setValue('');
    codeControl.clearFeedback();
    setSelectedOrg(null);
    setView('entry');
  };

  if (view === 'loading') {
    return (
      <Card.Root>
        <Card.Content>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  if (view === 'entry') {
    return (
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('oauthDeviceVerification.start.title')} />
            <Header.Subtitle localizationKey={localizationKeys('oauthDeviceVerification.start.subtitle')} />
          </Header.Root>
          <Form.Root onSubmit={handleLookup}>
            <Form.ControlRow elementId={codeControl.id}>
              <Form.CommonInputWrapper {...codeControl.props}>
                <OAuthDeviceVerificationCodeInput control={codeControl} />
              </Form.CommonInputWrapper>
            </Form.ControlRow>
            <Form.SubmitButton localizationKey={localizationKeys('oauthDeviceVerification.start.action__continue')} />
          </Form.Root>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  if (view === 'confirmation' && data) {
    const primaryIdentifier = user?.primaryEmailAddress?.emailAddress || user?.primaryPhoneNumber?.phoneNumber || '';
    const displayedScopes = data.scopes
      .filter(scope => scope.scope !== OFFLINE_ACCESS_SCOPE)
      .map(scope => ({
        ...scope,
        description:
          scope.scope === PRIVATE_METADATA_SCOPE
            ? t(
                localizationKeys('oauthConsent.scopeList.privateMetadata', {
                  applicationName,
                }),
              )
            : scope.description,
      }));
    const hasOfflineAccess = data.scopes.some(scope => scope.scope === OFFLINE_ACCESS_SCOPE);
    return (
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <DeviceLogo
              applicationName={data.oauthApplicationName}
              logoUrl={data.oauthApplicationLogoUrl}
              showClerkLogo={Boolean(logoImageUrl)}
            />
            <Header.Title
              localizationKey={localizationKeys('oauthDeviceVerification.confirmation.title', {
                applicationName: data.oauthApplicationName,
              })}
            />
            <Header.Subtitle
              localizationKey={localizationKeys('oauthDeviceVerification.confirmation.subtitle', {
                identifier: primaryIdentifier,
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
                localizationKey={localizationKeys('oauthDeviceVerification.confirmation.scopeListTitle', {
                  applicationName: data.oauthApplicationName,
                })}
              />
            </ListGroupHeader>
            <ListGroupContent>
              {displayedScopes.map(scope => (
                <ListGroupItem key={scope.scope}>
                  <ListGroupItemLabel>{scope.description || scope.scope}</ListGroupItemLabel>
                </ListGroupItem>
              ))}
            </ListGroupContent>
          </ListGroup>
          <Alert colorScheme='warning'>
            <Text
              colorScheme='warning'
              variant='caption'
              localizationKey={localizationKeys('oauthDeviceVerification.confirmation.warning')}
            />
          </Alert>
          <Grid
            columns={2}
            gap={3}
          >
            <Button
              colorScheme='secondary'
              variant='outline'
              isLoading={submittingDecision === 'deny' && verification.isSubmitting}
              isDisabled={verification.isSubmitting}
              onClick={() => void handleDeny()}
              localizationKey={localizationKeys('oauthDeviceVerification.confirmation.action__deny')}
            />
            <Button
              isLoading={submittingDecision === 'approve' && verification.isSubmitting}
              isDisabled={verification.isSubmitting}
              onClick={() => void handleApprove()}
              localizationKey={localizationKeys('oauthDeviceVerification.confirmation.action__approve')}
            />
            {hasOfflineAccess && (
              <Text
                sx={{ gridColumn: 'span 2' }}
                colorScheme='secondary'
                variant='caption'
                localizationKey={localizationKeys('oauthConsent.offlineAccessNotice')}
              />
            )}
          </Grid>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  if (view === 'confirmation') {
    return (
      <Card.Root>
        <Card.Content>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  const terminal = getTerminalContent(view);
  return (
    <Card.Root>
      <Card.Content>
        <Col gap={6}>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys(terminal.title)} />
            <Header.Subtitle localizationKey={localizationKeys(terminal.subtitle)} />
          </Header.Root>
          {terminal.canReset && (
            <Button
              block
              onClick={reset}
              localizationKey={localizationKeys('oauthDeviceVerification.action__tryAnotherCode')}
            />
          )}
        </Col>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
}

function DeviceLogo({
  applicationName,
  logoUrl,
  showClerkLogo,
}: {
  applicationName: string;
  logoUrl: string | null;
  showClerkLogo: boolean;
}) {
  const applicationMark = logoUrl ? (
    <Image
      src={logoUrl}
      alt={applicationName}
      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  ) : (
    <LogoGroupIcon label={applicationName} />
  );

  if (!showClerkLogo) {
    return (
      <LogoGroup>
        <LogoGroupItemContainer>{applicationMark}</LogoGroupItemContainer>
      </LogoGroup>
    );
  }

  return (
    <LogoGroup>
      <LogoGroupItem justify='end'>
        <LogoGroupItemContainer>{applicationMark}</LogoGroupItemContainer>
      </LogoGroupItem>
      <LogoGroupSeparator />
      <LogoGroupItem justify='start'>
        <LogoGroupItemContainer>
          <ApplicationLogo />
        </LogoGroupItemContainer>
      </LogoGroupItem>
    </LogoGroup>
  );
}

function getTerminalContent(view: Exclude<View, 'entry' | 'loading' | 'confirmation'>): {
  title: Parameters<typeof localizationKeys>[0];
  subtitle: Parameters<typeof localizationKeys>[0];
  canReset: boolean;
} {
  switch (view) {
    case 'approved':
      return {
        title: 'oauthDeviceVerification.status.approvedTitle',
        subtitle: 'oauthDeviceVerification.status.approvedSubtitle',
        canReset: false,
      };
    case 'alreadyApproved':
      return {
        title: 'oauthDeviceVerification.status.alreadyApprovedTitle',
        subtitle: 'oauthDeviceVerification.status.alreadyApprovedSubtitle',
        canReset: false,
      };
    case 'denied':
      return {
        title: 'oauthDeviceVerification.status.deniedTitle',
        subtitle: 'oauthDeviceVerification.status.deniedSubtitle',
        canReset: false,
      };
    case 'alreadyDenied':
      return {
        title: 'oauthDeviceVerification.status.alreadyDeniedTitle',
        subtitle: 'oauthDeviceVerification.status.alreadyDeniedSubtitle',
        canReset: false,
      };
    case 'consumed':
      return {
        title: 'oauthDeviceVerification.status.consumedTitle',
        subtitle: 'oauthDeviceVerification.status.consumedSubtitle',
        canReset: false,
      };
    case 'expired':
      return {
        title: 'oauthDeviceVerification.error.expiredTitle',
        subtitle: 'oauthDeviceVerification.error.expiredSubtitle',
        canReset: false,
      };
    case 'rateLimited':
      return {
        title: 'oauthDeviceVerification.error.rateLimitedTitle',
        subtitle: 'oauthDeviceVerification.error.rateLimitedSubtitle',
        canReset: false,
      };
    case 'alreadyDecided':
      return {
        title: 'oauthDeviceVerification.status.alreadyDecidedTitle',
        subtitle: 'oauthDeviceVerification.status.alreadyDecidedSubtitle',
        canReset: false,
      };
    case 'error':
      return {
        title: 'oauthDeviceVerification.error.genericTitle',
        subtitle: 'oauthDeviceVerification.error.genericSubtitle',
        canReset: true,
      };
  }
}

const AuthenticatedRoutes = withCoreUserGuard(withCardStateProvider(OAuthDeviceVerificationInternal));

export const OAuthDeviceVerification = () => (
  <Flow.Root flow='oauthDeviceVerification'>
    <Flow.Part>
      <Switch>
        <Route>
          <AuthenticatedRoutes />
        </Route>
      </Switch>
    </Flow.Part>
  </Flow.Root>
);
