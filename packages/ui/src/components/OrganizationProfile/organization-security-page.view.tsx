import React from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { ConfigureDirectorySyncWizard } from '../ConfigureDirectorySync/ConfigureDirectorySyncWizard';
import { SecurityDirectorySyncSection } from '../ConfigureDirectorySync/SecurityDirectorySyncSection';
import { ConfigureSSOWizard } from '../ConfigureSSO/ConfigureSSOWizard';
import { EnterpriseConnectionPage } from './EnterpriseConnectionPage';
import type { useOrganizationSecurityPageController } from './organization-security-page.controller';
import { SecurityBackControl } from './SecurityBackControl';
import { SecuritySSOBypassSection } from './SecuritySSOBypassSection';
import { SecuritySsoSection } from './SecuritySsoSection';
import { SSOBypassAllowlistPage } from './SSOBypassAllowlistPage';

type OrganizationSecurityPageViewProps = {
  contentRef: React.RefObject<HTMLDivElement>;
  controller: ReturnType<typeof useOrganizationSecurityPageController>;
};

export const OrganizationSecurityPageView = ({ contentRef, controller }: OrganizationSecurityPageViewProps) => {
  const {
    organizationName,
    isLoading,
    enterpriseConnection,
    enterpriseConnections,
    connectionDomains,
    setConnectionDomains,
    claimedDomains,
    organizationEnterpriseConnection,
    testRuns,
    enterpriseConnectionMutations,
    organizationDomains,
    organizationDomainMutations,
    canManageConnections,
    showDirectorySync,
    showSSOBypass,
    view,
    openedConnection,
    exitToOverview,
    openWizard,
    openConnection,
    openSSOBypass,
    openDirectorySync,
  } = controller;

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

  if (view.kind === 'ssoBypass') {
    return <SSOBypassAllowlistPage onBack={exitToOverview} />;
  }

  if (view.kind === 'connection' && openedConnection) {
    return (
      <EnterpriseConnectionPage
        connection={openedConnection}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        onBack={exitToOverview}
      />
    );
  }

  if (view.kind === 'wizard') {
    return (
      <ConfigureSSOWizard
        ownerKey={controller.ownerKey}
        canRun={controller.canRun}
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
        title={<SecurityBackControl onClick={exitToOverview} />}
        onExit={exitToOverview}
      />
    );
  }

  return (
    <SecurityPageOverview>
      <SecuritySsoSection
        ownerKey={controller.ownerKey}
        canRun={controller.canRun}
        enterpriseConnections={enterpriseConnections}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        organizationName={organizationName}
        contentRef={contentRef}
        onConfigure={canManageConnections ? openWizard : undefined}
        onOpenConnection={canManageConnections ? openConnection : undefined}
      />
      {showSSOBypass && <SecuritySSOBypassSection onManage={openSSOBypass} />}
      {showDirectorySync && (
        <SecurityDirectorySyncSection
          organizationName={organizationName}
          contentRef={contentRef}
          onConfigure={openDirectorySync}
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
