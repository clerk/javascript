import { __internal_useOrganizationEnterpriseConnections, useOrganization } from '@clerk/shared/react';
import React, { useMemo, useState } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { useProtect } from '../../common';
import { useEnvironment } from '../../contexts';
import { Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { ConfigureDirectorySyncWizard } from '../ConfigureDirectorySync/ConfigureDirectorySyncWizard';
import { SecurityDirectorySyncSection } from '../ConfigureDirectorySync/SecurityDirectorySyncSection';
import { ConfigureSSOWizard } from '../ConfigureSSO/ConfigureSSOWizard';
import type { ConnectionScope } from '../ConfigureSSO/domain/connectionScope';
import { sortEnterpriseConnections } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { EnterpriseConnectionPage } from './EnterpriseConnectionPage';
import { SecurityBackControl } from './SecurityBackControl';
import { SecuritySsoBypassSection } from './SecuritySsoBypassSection';
import { SecuritySsoSection } from './SecuritySsoSection';
import { SsoBypassAllowlistPage } from './SsoBypassAllowlistPage';

type OrganizationSecurityPageProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

type WizardReturnTo = { kind: 'overview' } | { kind: 'connection'; id: string };

type SecurityPageView =
  | { kind: 'overview' }
  | { kind: 'wizard'; forceInitialStep: boolean; returnTo: WizardReturnTo }
  | { kind: 'connection'; id: string }
  | { kind: 'directorySync' }
  | { kind: 'ssoBypass' };

export const OrganizationSecurityPage = ({ contentRef }: OrganizationSecurityPageProps) => {
  const { organization } = useOrganization();
  const canManageConnections = useProtect({ permission: 'org:sys_entconns:manage' });
  const canManageSsoBypass = useProtect({ permission: 'org:sys_entconns_sso_bypass:manage' });

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  if (!canManageConnections) {
    return <SsoBypassOnlySecurityPage canManageSsoBypass={canManageSsoBypass} />;
  }

  return (
    <OrganizationSecurityPageContent
      contentRef={contentRef}
      canManageSsoBypass={canManageSsoBypass}
    />
  );
};

const OrganizationSecurityPageContent = ({
  contentRef,
  canManageSsoBypass,
}: OrganizationSecurityPageProps & { canManageSsoBypass: boolean }) => {
  const {
    organization,
    isLoading,
    enterpriseConnection,
    enterpriseConnections,
    selectConnection,
    connectionDomains,
    setConnectionDomains,
    claimedDomains,
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

  const openWizard = (
    scope: ConnectionScope,
    forceInitialStep = false,
    returnTo: WizardReturnTo = { kind: 'overview' },
  ) => {
    selectConnection(scope);
    setRequestedView({ kind: 'wizard', forceInitialStep, returnTo });
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
    return <SecurityPageLoading />;
  }

  if (view.kind === 'directorySync') {
    return (
      <ConfigureDirectorySyncWizard
        title={<SecurityBackControl onClick={exitToOverview} />}
        onExit={exitToOverview}
      />
    );
  }

  if (view.kind === 'ssoBypass') {
    return <SsoBypassAllowlistPage onBack={exitToOverview} />;
  }

  if (view.kind === 'connection' && openedConnection) {
    return (
      <EnterpriseConnectionPage
        connection={openedConnection}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        organizationName={organization?.name ?? ''}
        contentRef={contentRef}
        onBack={exitToOverview}
        onOpenWizard={() =>
          openWizard({ kind: 'existing', id: openedConnection.id }, false, {
            kind: 'connection',
            id: openedConnection.id,
          })
        }
      />
    );
  }

  if (view.kind === 'wizard') {
    const { returnTo } = view;
    const exitWizard = () =>
      setRequestedView(
        returnTo.kind === 'connection' && enterpriseConnections.some(connection => connection.id === returnTo.id)
          ? returnTo
          : { kind: 'overview' },
      );

    return (
      <ConfigureSSOWizard
        organizationEnterpriseConnection={organizationEnterpriseConnection}
        testRuns={testRuns}
        enterpriseConnection={enterpriseConnection}
        connectionDomains={connectionDomains}
        setConnectionDomains={setConnectionDomains}
        claimedDomains={claimedDomains}
        contentRef={contentRef}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        organizationDomainMutations={organizationDomainMutations}
        organizationDomains={organizationDomains}
        forceInitialStep={view.forceInitialStep}
        title={<SecurityBackControl onClick={exitWizard} />}
        onExit={exitWizard}
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
      {canManageSsoBypass && enterpriseConnections.length > 0 && (
        <SecuritySsoBypassSection onManage={() => setRequestedView({ kind: 'ssoBypass' })} />
      )}
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

const SsoBypassOnlySecurityPage = ({ canManageSsoBypass }: { canManageSsoBypass: boolean }) => {
  const { data, isLoading } = __internal_useOrganizationEnterpriseConnections();
  const enterpriseConnections = useMemo(() => sortEnterpriseConnections(data ?? []), [data]);
  const [view, setView] = useState<'overview' | 'ssoBypass'>('overview');

  if (isLoading) {
    return <SecurityPageLoading />;
  }

  if (view === 'ssoBypass') {
    return <SsoBypassAllowlistPage onBack={() => setView('overview')} />;
  }

  return (
    <SecurityPageOverview>
      <SecuritySsoSection enterpriseConnections={enterpriseConnections} />
      {canManageSsoBypass && enterpriseConnections.length > 0 && (
        <SecuritySsoBypassSection onManage={() => setView('ssoBypass')} />
      )}
    </SecurityPageOverview>
  );
};

const SecurityPageLoading = (): JSX.Element => (
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
