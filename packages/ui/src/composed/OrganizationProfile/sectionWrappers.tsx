import type { ReactNode } from 'react';

import { Protect } from '../../common';
import {
  OrganizationDeleteSection,
  OrganizationDomainsSection,
  OrganizationLeaveSection,
  OrganizationProfileSection,
} from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { useRequirePage } from '../useRequirePage';

export function GeneralOrganizationProfile(): ReactNode {
  if (!useRequirePage('GeneralOrganizationProfile')) return null;
  return <OrganizationProfileSection />;
}

export function GeneralVerifiedDomains(): ReactNode {
  if (!useRequirePage('GeneralVerifiedDomains')) return null;
  return (
    <Protect permission='org:sys_domains:read'>
      <OrganizationDomainsSection />
    </Protect>
  );
}

export function GeneralLeaveOrganization(): ReactNode {
  if (!useRequirePage('GeneralLeaveOrganization')) return null;
  return <OrganizationLeaveSection />;
}

export function GeneralDeleteOrganization(): ReactNode {
  if (!useRequirePage('GeneralDeleteOrganization')) return null;
  return <OrganizationDeleteSection />;
}
