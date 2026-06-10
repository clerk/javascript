import { useOrganization } from '@clerk/shared/react';

import { ConfigureSSOProtect } from '../ConfigureSSO/ConfigureSSO';
import { ConfigureSSOSkeleton } from '../ConfigureSSO/ConfigureSSOSkeleton';
import { ConfigureSSOWizard } from '../ConfigureSSO/ConfigureSSOWizard';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';

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
 * The page-owned data layer: fetches through the umbrella hook, gates loading
 * and permission, and injects the resolved data into the pure
 * `ConfigureSSOWizard`. A separate component below the page (rather than
 * inlined into it) so the connection hook only ever runs behind the page's
 * organization check.
 */
const OrganizationSecurityPageContent = ({ contentRef }: OrganizationSecurityPageProps) => {
  const {
    isLoading,
    enterpriseConnection,
    organizationEnterpriseConnection,
    testRuns,
    mutations,
    primaryEmailAddress,
  } = useOrganizationEnterpriseConnection();

  // Gate loading one level above the provider so the context never observes a
  // loading state. The single test-run source is part of this initial fetch
  // when a connection exists at load, so a cold landing on the test step is
  // covered by the full skeleton here.
  if (isLoading) {
    return <ConfigureSSOSkeleton />;
  }

  return (
    <ConfigureSSOProtect>
      <ConfigureSSOWizard
        organizationEnterpriseConnection={organizationEnterpriseConnection}
        testRuns={testRuns}
        enterpriseConnection={enterpriseConnection}
        contentRef={contentRef}
        mutations={mutations}
        primaryEmailAddress={primaryEmailAddress}
      />
    </ConfigureSSOProtect>
  );
};
