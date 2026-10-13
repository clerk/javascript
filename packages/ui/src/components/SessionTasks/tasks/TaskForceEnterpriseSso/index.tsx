import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { useEffect, useState } from 'react';

import { useSignOutContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { Button, Col, descriptors, Flow, localizationKeys, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { LoadingCardContainer } from '@/ui/elements/LoadingCard';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';
import { handleError } from '@/ui/utils/errorHandler';
import { clerkWindowNavigate } from '@/ui/utils/windowNavigate';

import { withTaskGuard } from '../shared';

const isSSORequiredConnection = (connection: EnterpriseConnectionResource) =>
  connection.active && connection.allowOrganizationAccountLinking && !!connection.samlConnection;

const TaskForceEnterpriseSSOInternal = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const card = useCardState();
  const { otherSessions } = useMultipleSessions({ user: clerk.user });
  const { navigateAfterSignOut, navigateAfterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const [connection, setConnection] = useState<EnterpriseConnectionResource | null>();

  const organization = user?.organizationMemberships.find(
    membership => membership.organization.id === clerk.session?.lastActiveOrganizationId,
  )?.organization;

  useEffect(() => {
    if (!organization) {
      setConnection(null);
      return;
    }

    organization
      .getEnterpriseConnections()
      .then(connections => setConnection(connections.find(isSSORequiredConnection) ?? null))
      .catch(err => {
        setConnection(null);
        handleError(err, [], card.setError);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  const createExternalAccount = useReverification((enterpriseConnectionId: string) =>
    user?.createExternalAccount({ enterpriseConnectionId, redirectUrl: window.location.href }),
  );

  const continueWithSSO = (enterpriseConnectionId: string) =>
    card
      .runAsync(async () => {
        const externalAccount = await createExternalAccount(enterpriseConnectionId);
        const redirectUrl = externalAccount?.verification?.externalVerificationRedirectURL;
        if (redirectUrl) {
          clerkWindowNavigate(clerk, redirectUrl);
        }
      })
      .catch(err => handleError(err, [], card.setError));

  const handleSignOut = () => {
    if (otherSessions.length === 0) {
      return clerk.signOut(navigateAfterSignOut);
    }

    return clerk.signOut(navigateAfterMultiSessionSingleSignOutUrl, { sessionId: clerk.session?.id });
  };

  const identifier = clerk.user?.primaryEmailAddress?.emailAddress ?? clerk.user?.username;

  if (connection === undefined) {
    return (
      <Card.Root>
        <Card.Content>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    );
  }

  return (
    <Flow.Root flow='taskForceEnterpriseSso'>
      <Flow.Part part='start'>
        <Card.Root>
          <Card.Content>
            <Header.Root showLogo>
              <Header.Title localizationKey={localizationKeys('taskForceEnterpriseSso.title')} />
              <Header.Subtitle
                localizationKey={localizationKeys('taskForceEnterpriseSso.subtitle', {
                  organizationName: organization?.name ?? '',
                })}
              />
            </Header.Root>
            <Card.Alert>{card.error}</Card.Alert>
            <Col
              elementDescriptor={descriptors.main}
              gap={4}
            >
              {connection ? (
                <Button
                  elementDescriptor={descriptors.formButtonPrimary}
                  block
                  isLoading={card.isLoading}
                  onClick={() => {
                    void continueWithSSO(connection.id);
                  }}
                  localizationKey={localizationKeys('taskForceEnterpriseSso.formButtonPrimary', {
                    connectionName: connection.name,
                  })}
                />
              ) : (
                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys('taskForceEnterpriseSso.connectionUnavailable')}
                />
              )}
            </Col>
          </Card.Content>

          <Card.Footer>
            <Card.Action
              elementId='signOut'
              gap={2}
              justify='center'
              sx={() => ({ width: '100%' })}
            >
              {identifier && (
                <Card.ActionText
                  truncate
                  localizationKey={localizationKeys('taskForceEnterpriseSso.signOut.actionText', {
                    identifier,
                  })}
                />
              )}
              <Card.ActionLink
                sx={() => ({ flexShrink: 0 })}
                onClick={() => {
                  void handleSignOut();
                }}
                localizationKey={localizationKeys('taskForceEnterpriseSso.signOut.actionLink')}
              />
            </Card.Action>
          </Card.Footer>
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
};

export const TaskForceEnterpriseSSO = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskForceEnterpriseSSOInternal), 'force-enterprise-sso'),
);
