import { useOrganization } from '@clerk/shared/react';
import React, { useState } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Col, descriptors, Icon, localizationKeys, SimpleButton, Text } from '../../customizables';
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

  if (isLoading) {
    return <ConfigureSSOSkeleton />;
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
              <SecuritySsoSection
                connection={organizationEnterpriseConnection}
                enterpriseConnection={enterpriseConnection}
                setConnectionActive={enterpriseConnectionMutations.setConnectionActive}
                deleteConnection={enterpriseConnectionMutations.deleteConnection}
                organizationName={organization?.name ?? ''}
                contentRef={contentRef}
                onConfigure={openWizard}
              />
            </Col>
          </Col>
        </ProfileCard.Page>
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
