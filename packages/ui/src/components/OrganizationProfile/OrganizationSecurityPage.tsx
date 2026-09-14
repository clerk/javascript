import { useOrganization } from '@clerk/shared/react';
import React, { useState } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { useEnvironment } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { ConfigureDirectorySyncWizard } from '../ConfigureDirectorySync/ConfigureDirectorySyncWizard';
import { SecurityDirectorySyncSection } from '../ConfigureDirectorySync/SecurityDirectorySyncSection';
import { ConfigureSSOWizard } from '../ConfigureSSO/ConfigureSSOWizard';
import type { ConnectionScope } from '../ConfigureSSO/domain/connectionScope';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { EnterpriseConnectionPage } from './EnterpriseConnectionPage';
import { SecurityBackControl } from './SecurityBackControl';
import { SecuritySsoSection } from './SecuritySsoSection';

type OrganizationSecurityPageProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

type SecurityPageView =
  | { kind: 'overview' }
  | { kind: 'wizard'; forceInitialStep: boolean }
  | { kind: 'connection'; id: string }
  | { kind: 'directorySync' };

export const OrganizationSecurityPage = ({ contentRef }: OrganizationSecurityPageProps) => {
  const { organization } = useOrganization();

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return <OrganizationSecurityPageContent contentRef={contentRef} />;
};

const OrganizationSecurityPageContent = ({ contentRef }: OrganizationSecurityPageProps) => {
  const {
    organization,
    isLoading,
    enterpriseConnection,
    enterpriseConnections,
    connectionScope,
    selectConnection,
    organizationEnterpriseConnection,
    testRuns,
    enterpriseConnectionMutations,
    organizationDomains,
    organizationDomainMutations,
  } = useOrganizationEnterpriseConnection();

  const { userSettings } = useEnvironment();
  const showDirectorySync = userSettings.enterpriseSSO.self_serve_directory_sync;

  const [requestedView, setRequestedView] = useState<SecurityPageView>({ kind: 'overview' });

  const exitToOverview = () => setRequestedView({ kind: 'overview' });

  const openWizard = (scope: ConnectionScope, forceInitialStep = false) => {
    selectConnection(scope);
    setRequestedView({ kind: 'wizard', forceInitialStep });
  };

  const openConnection = (id: string) => setRequestedView({ kind: 'connection', id });

  const openedConnection =
    requestedView.kind === 'connection'
      ? enterpriseConnections.find(connection => connection.id === requestedView.id)
      : undefined;

  // A connection page whose connection is gone (removed here, or in another tab)
  // falls back to the overview. Derived at render so no effect has to chase it.
  const view: SecurityPageView =
    requestedView.kind === 'connection' && !openedConnection ? { kind: 'overview' } : requestedView;

  // Gate the page-level loading overview to the overview view only. A wizard is
  // only ever opened after the overview has settled (it gates on `isLoading`),
  // so once `view.kind === 'wizard'` the connection data is present and stays warm; a
  // later `isLoading` flip (e.g. the test-runs query cold-loading after a
  // configure write) must not tear the open wizard down and reseat it — each
  // wizard step owns its own loading UI.
  if (isLoading && view.kind === 'overview') {
    return (
      <SecurityPageOverview fillHeight>
        <Flex
          align='center'
          justify='center'
          sx={t => ({ flex: 1, paddingBlock: t.space.$5 })}
        >
          <Spinner
            size='xs'
            colorScheme='neutral'
            elementDescriptor={descriptors.spinner}
          />
        </Flex>
      </SecurityPageOverview>
    );
  }

  if (view.kind === 'directorySync') {
    return (
      <ConfigureDirectorySyncWizard
        title={<SecurityBackControl onClick={exitToOverview} />}
        onExit={exitToOverview}
      />
    );
  }

  if (view.kind === 'connection' && openedConnection) {
    return (
      <EnterpriseConnectionPage
        connection={openedConnection}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        organizationName={organization?.name ?? ''}
        contentRef={contentRef}
        onBack={exitToOverview}
        onOpenWizard={() => openWizard({ kind: 'existing', id: openedConnection.id })}
      />
    );
  }

  if (view.kind === 'wizard') {
    return (
      <ConfigureSSOWizard
        organizationEnterpriseConnection={organizationEnterpriseConnection}
        testRuns={testRuns}
        enterpriseConnection={enterpriseConnection}
        enterpriseConnections={enterpriseConnections}
        connectionScope={connectionScope}
        contentRef={contentRef}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        organizationDomainMutations={organizationDomainMutations}
        organizationDomains={organizationDomains}
        forceInitialStep={view.forceInitialStep}
        title={<SecurityBackControl onClick={exitToOverview} />}
        onExit={exitToOverview}
      />
    );
  }

  return (
    <SecurityPageOverview>
      <SecuritySsoSection
        enterpriseConnections={enterpriseConnections}
        onConfigure={openWizard}
        onOpenConnection={openConnection}
      />
      {showDirectorySync && (
        <SecurityDirectorySyncSection
          organizationName={organization?.name ?? ''}
          contentRef={contentRef}
          onConfigure={() => setRequestedView({ kind: 'directorySync' })}
        />
      )}
    </SecurityPageOverview>
  );
};

/**
 * The overview's stable page chrome — the security `ProfileCard.Page` and its
 * "Security" header. Both the settled overview and the on-mount loading state
 * render through this, so the section body is the only thing that swaps in.
 *
 * `fillHeight` grows the page to the scroll box so the loading state's spinner
 * can center in the remaining height beneath the header.
 */
const SecurityPageOverview = ({
  children,
  fillHeight = false,
}: {
  children: React.ReactNode;
  fillHeight?: boolean;
}): JSX.Element => (
  <ProfileCard.Page sx={fillHeight ? { flex: 1 } : undefined}>
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, ...(fillHeight && { flex: 1 }) })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationSecurity')}
        sx={fillHeight ? { flex: 1 } : undefined}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.securityPage.title')}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h2'
          />
        </Header.Root>
        {children}
      </Col>
    </Col>
  </ProfileCard.Page>
);
