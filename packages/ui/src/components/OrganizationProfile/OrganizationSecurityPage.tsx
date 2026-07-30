import { useOrganization } from '@clerk/shared/react';
import React, { useState } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import {
  Badge,
  Col,
  descriptors,
  Flex,
  Icon,
  localizationKeys,
  SimpleButton,
  Spinner,
  Text,
} from '../../customizables';
import { ChevronLeft } from '../../icons';
import { ConfigureDirectorySyncWizard } from '../ConfigureDirectorySync/ConfigureDirectorySyncWizard';
import { SecurityDirectorySyncSection } from '../ConfigureDirectorySync/SecurityDirectorySyncSection';
import { ConfigureIdentityProviderWizard } from '../ConfigureIdentityProvider/ConfigureIdentityProviderWizard';
import {
  isIdentityProviderSetupComplete,
  SecurityIdentityProviderSection,
} from '../ConfigureIdentityProvider/SecurityIdentityProviderSection';
import { ConfigureSSOWizard } from '../ConfigureSSO/ConfigureSSOWizard';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { SecuritySsoSection } from './SecuritySsoSection';

type OrganizationSecurityPageProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

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
    organizationEnterpriseConnection,
    testRuns,
    enterpriseConnectionMutations,
    organizationDomains,
    organizationDomainMutations,
  } = useOrganizationEnterpriseConnection();

  const [view, setView] = useState<'overview' | 'wizard' | 'directorySync' | 'idpSetup'>('overview');
  const [forceFirstStep, setForceFirstStep] = useState(false);

  const exitWizard = () => setView('overview');

  const openWizard = (forceInitialStep = false) => {
    setForceFirstStep(forceInitialStep);
    setView('wizard');
  };

  // Gate the page-level loading overview to the overview view only. A wizard is
  // only ever opened after the overview has settled (it gates on `isLoading`),
  // so once `view === 'wizard'` the connection data is present and stays warm; a
  // later `isLoading` flip (e.g. the test-runs query cold-loading after a
  // configure write) must not tear the open wizard down and reseat it — each
  // wizard step owns its own loading UI.
  if (isLoading && view === 'overview') {
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

  const backControl = (
    <SimpleButton
      elementDescriptor={descriptors.configureSSOHeaderBackButton}
      variant='unstyled'
      onClick={exitWizard}
      sx={t => ({
        gap: t.space.$1,
        padding: 0,
        color: t.colors.$colorMutedForeground,
        '&:hover': { color: t.colors.$colorForeground },
      })}
    >
      <Icon icon={ChevronLeft} />
      <Text
        as='span'
        variant='body'
        localizationKey={localizationKeys('organizationProfile.navbar.security')}
      />
    </SimpleButton>
  );

  if (view === 'directorySync') {
    return (
      <ConfigureDirectorySyncWizard
        title={backControl}
        onExit={exitWizard}
      />
    );
  }

  if (view === 'idpSetup') {
    return (
      <ConfigureIdentityProviderWizard
        organizationEnterpriseConnection={organizationEnterpriseConnection}
        testRuns={testRuns}
        enterpriseConnection={enterpriseConnection}
        contentRef={contentRef}
        enterpriseConnectionMutations={enterpriseConnectionMutations}
        organizationDomainMutations={organizationDomainMutations}
        organizationDomains={organizationDomains}
        title={backControl}
        onExit={exitWizard}
      />
    );
  }

  // PROTOTYPE ONLY: SSO and Directory Sync are gated on the identity-provider
  // setup flow (verified domains + configured connection) being completed.
  const setupComplete = isIdentityProviderSetupComplete(organizationEnterpriseConnection, organizationDomains);

  return view === 'overview' ? (
    <SecurityPageOverview>
      <SecurityIdentityProviderSection
        connection={organizationEnterpriseConnection}
        organizationDomains={organizationDomains}
        onConfigure={() => setView('idpSetup')}
      />
      {setupComplete ? (
        <SecuritySsoSection
          connection={organizationEnterpriseConnection}
          enterpriseConnection={enterpriseConnection}
          setConnectionActive={enterpriseConnectionMutations.setConnectionActive}
          deleteConnection={enterpriseConnectionMutations.deleteConnection}
          organizationName={organization?.name ?? ''}
          contentRef={contentRef}
          onConfigure={openWizard}
        />
      ) : (
        <GatedSecuritySection
          title='Single sign-on'
          hint='Complete identity provider setup to configure Single Sign-On.'
        />
      )}
      {setupComplete ? (
        <SecurityDirectorySyncSection onConfigure={() => setView('directorySync')} />
      ) : (
        <GatedSecuritySection
          title='Directory Sync'
          hint='Complete identity provider setup to configure Directory Sync.'
        />
      )}
    </SecurityPageOverview>
  ) : (
    <ConfigureSSOWizard
      organizationEnterpriseConnection={organizationEnterpriseConnection}
      testRuns={testRuns}
      enterpriseConnection={enterpriseConnection}
      contentRef={contentRef}
      enterpriseConnectionMutations={enterpriseConnectionMutations}
      organizationDomainMutations={organizationDomainMutations}
      organizationDomains={organizationDomains}
      forceInitialStep={forceFirstStep}
      title={backControl}
      onExit={exitWizard}
    />
  );
};

/**
 * PROTOTYPE ONLY — placeholder for a section whose flow is locked behind the
 * identity-provider setup prerequisite.
 */
const GatedSecuritySection = ({ title, hint }: { title: string; hint: string }): JSX.Element => (
  <Col
    sx={t => ({
      gap: t.space.$3,
      paddingBlock: t.space.$4,
      borderTopWidth: t.borderWidths.$normal,
      borderTopStyle: t.borderStyles.$solid,
      borderTopColor: t.colors.$borderAlpha100,
      opacity: 0.7,
    })}
  >
    <Flex
      align='center'
      sx={t => ({ gap: t.space.$2 })}
    >
      <Text
        as='p'
        variant='h3'
      >
        {title}
      </Text>
      <Badge colorScheme='primary'>Requires setup</Badge>
    </Flex>
    <Text
      as='p'
      colorScheme='secondary'
    >
      {hint}
    </Text>
  </Col>
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
