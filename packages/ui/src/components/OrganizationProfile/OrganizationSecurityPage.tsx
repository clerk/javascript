import { useOrganization } from '@clerk/shared/react';
import React, { useState } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { ProfileSection } from '@/ui/elements/Section';

import { Col, descriptors, Flex, Icon, localizationKeys, SimpleButton, Spinner, Text } from '../../customizables';
import { ChevronLeft } from '../../icons';
import { ConfigureSSOProtect } from '../ConfigureSSO/ConfigureSSO';
import { ConfigureSSOSkeleton } from '../ConfigureSSO/ConfigureSSOSkeleton';
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

  const [view, setView] = useState<'overview' | 'wizard'>('overview');
  const [forceFirstStep, setForceFirstStep] = useState(false);

  const exitWizard = () => setView('overview');

  const openWizard = (forceInitialStep = false) => {
    setForceFirstStep(forceInitialStep);
    setView('wizard');
  };

  // Loading is on mount, where `view` is still 'overview': keep the page chrome
  // (the "Security" header + the SSO section frame) stable and swap only the
  // section body for a placeholder, so the settled overview replaces it in place
  // — no header pop-in, no swap into a differently-shaped wizard skeleton. The
  // wizard skeleton stays for the rare case loading is ever entered from within
  // the wizard view itself.
  if (isLoading) {
    return view === 'wizard' ? (
      <ConfigureSSOSkeleton />
    ) : (
      <ConfigureSSOProtect>
        <SecurityPageOverview>
          <SecuritySsoSectionSkeleton />
        </SecurityPageOverview>
      </ConfigureSSOProtect>
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

  return (
    <ConfigureSSOProtect>
      {view === 'overview' ? (
        <SecurityPageOverview>
          <SecuritySsoSection
            connection={organizationEnterpriseConnection}
            enterpriseConnection={enterpriseConnection}
            setConnectionActive={enterpriseConnectionMutations.setConnectionActive}
            deleteConnection={enterpriseConnectionMutations.deleteConnection}
            organizationName={organization?.name ?? ''}
            contentRef={contentRef}
            onConfigure={openWizard}
          />
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
      )}
    </ConfigureSSOProtect>
  );
};

/**
 * The overview's stable page chrome — the security `ProfileCard.Page` and its
 * "Security" header. Both the settled overview and the on-mount loading state
 * render through this, so the section body is the only thing that swaps in.
 */
const SecurityPageOverview = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <ProfileCard.Page>
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8 })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationSecurity')}
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

/**
 * Overview-shaped loading placeholder for the SSO section: the real section's
 * frame (same title + id) wrapping a centered spinner. Mirrors how other
 * OrganizationProfile sections show in-frame loading rather than swapping in a
 * differently-shaped skeleton.
 */
const SecuritySsoSectionSkeleton = (): JSX.Element => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.ssoSection.title')}
    id='sso'
    centered={false}
  >
    <Flex
      align='center'
      justify='center'
      sx={t => ({ paddingBlock: t.space.$5 })}
    >
      <Spinner
        size='sm'
        colorScheme='neutral'
        elementDescriptor={descriptors.spinner}
      />
    </Flex>
  </ProfileSection.Root>
);
