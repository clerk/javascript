import { useOrganization } from '@clerk/shared/react';
import { useState } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import { Col, descriptors, localizationKeys } from '../../customizables';
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

/** Separate from the page so the connection hook only runs behind the organization check. */
const OrganizationSecurityPageContent = ({ contentRef }: OrganizationSecurityPageProps) => {
  const {
    isLoading,
    organization,
    enterpriseConnection,
    organizationEnterpriseConnection,
    testRuns,
    mutations,
    primaryEmailAddress,
  } = useOrganizationEnterpriseConnection();

  const [view, setView] = useState<'overview' | 'wizard'>('overview');

  // Gate loading above the provider so the context never observes a loading state.
  if (isLoading) {
    return <ConfigureSSOSkeleton />;
  }

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
                setConnectionActive={mutations.setConnectionActive}
                deleteConnection={mutations.deleteConnection}
                organizationName={organization?.name ?? ''}
                contentRef={contentRef}
                onConfigure={() => setView('wizard')}
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
          mutations={mutations}
          primaryEmailAddress={primaryEmailAddress}
        />
      )}
    </ConfigureSSOProtect>
  );
};
