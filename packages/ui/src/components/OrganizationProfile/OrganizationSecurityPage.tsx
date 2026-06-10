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

/**
 * The page-owned data layer: fetches through the umbrella hook ONCE, gates
 * loading and permission, and injects the resolved data down — as props into
 * the overview section, or into the pure `ConfigureSSOWizard` (which mounts its
 * own provider). A separate component below the page (rather than inlined into
 * it) so the connection hook only ever runs behind the page's organization
 * check.
 */
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

  // The page always lands on the overview; the wizard is entered explicitly via
  // Start / Continue / Edit. There is no back-from-wizard affordance yet —
  // returning is a reload for now; a follow-up adds the wizard-header button.
  const [view, setView] = useState<'overview' | 'wizard'>('overview');

  // Gate loading one level above both views so neither ever observes a loading
  // state. The single test-run source is part of this initial fetch when a
  // connection exists at load, so the overview's status (and a cold landing on
  // the wizard's test step) is covered by the full skeleton here.
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
