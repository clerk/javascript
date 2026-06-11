import { useOrganization } from '@clerk/shared/react';

import { ConfigureSSOContent } from '../ConfigureSSO/ConfigureSSO';

type OrganizationSecurityPageProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

export const OrganizationSecurityPage = ({ contentRef }: OrganizationSecurityPageProps) => {
  const { organization } = useOrganization();

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return <ConfigureSSOContent contentRef={contentRef} />;
};
