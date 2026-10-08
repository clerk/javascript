import { Button, Col, Grid, Image, localizationKeys, Text } from '@/ui/customizables';
import { ApplicationLogo } from '@/ui/elements/ApplicationLogo';
import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';
import { Alert } from '@/ui/primitives';

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
import type { DeviceView, useOAuthDeviceVerificationController } from './oauth-device-verification.controller';
import { OAuthDeviceVerificationCodeInput } from './OAuthDeviceVerificationCodeInput';

export const OAuthDeviceVerificationView = ({
  controller,
}: {
  controller: ReturnType<typeof useOAuthDeviceVerificationController>;
}) => {
  const {
    view,
    codeControl,
    data,
    primaryIdentifier,
    showClerkLogo,
    orgSelectionEnabled,
    orgOptions,
    effectiveOrg,
    isSubmitting,
    submittingDecision,
    onLookup,
    onApprove,
    onDeny,
    onSelectOrg,
    onReset,
  } = controller;

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
          <Form.Root onSubmit={onLookup}>
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
    const { displayedScopes, hasOfflineAccess } = data;
    return (
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <DeviceLogo
              applicationName={data.oauthApplicationName}
              logoUrl={data.oauthApplicationLogoUrl}
              showClerkLogo={showClerkLogo}
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
              onChange={onSelectOrg}
            />
          )}
          {displayedScopes.length > 0 && (
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
          )}
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
              isLoading={submittingDecision === 'deny' && isSubmitting}
              isDisabled={isSubmitting}
              onClick={() => void onDeny()}
              localizationKey={localizationKeys('oauthDeviceVerification.confirmation.action__deny')}
            />
            <Button
              isLoading={submittingDecision === 'approve' && isSubmitting}
              isDisabled={isSubmitting}
              onClick={() => void onApprove()}
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
              onClick={onReset}
              localizationKey={localizationKeys('oauthDeviceVerification.action__tryAnotherCode')}
            />
          )}
        </Col>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

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

function getTerminalContent(view: Exclude<DeviceView, 'entry' | 'loading' | 'confirmation'>): {
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
