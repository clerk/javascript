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

/** Separate from the page so the connection hook only runs behind the organization check. */
const OrganizationSecurityPageContent = ({ contentRef }: OrganizationSecurityPageProps) => {
  const {
    isLoading,
    enterpriseConnection,
    organizationEnterpriseConnection,
    testRuns,
    mutations,
    primaryEmailAddress,
  } = useOrganizationEnterpriseConnection();

  // Gate loading above the provider so the context never observes a loading state.
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
