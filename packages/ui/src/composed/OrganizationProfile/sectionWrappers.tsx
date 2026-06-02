import { useContext, type ReactNode } from 'react';

import { Protect } from '../../common';
import { assertContextExists } from '../../contexts/utils';
import {
  OrganizationDeleteSection,
  OrganizationDomainsSection,
  OrganizationLeaveSection,
  OrganizationProfileSection,
} from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { PageContext } from '../PageContext';

function useAssertPage(componentName: string) {
  const page = useContext(PageContext);
  assertContextExists(page, componentName);
  return page;
}

export function GeneralOrganizationProfile(): ReactNode {
  useAssertPage('GeneralOrganizationProfile');
  return <OrganizationProfileSection />;
}

export function GeneralVerifiedDomains(): ReactNode {
  useAssertPage('GeneralVerifiedDomains');
  return (
    <Protect permission='org:sys_domains:read'>
      <OrganizationDomainsSection />
    </Protect>
  );
}

export function GeneralLeaveOrganization(): ReactNode {
  useAssertPage('GeneralLeaveOrganization');
  return <OrganizationLeaveSection />;
}

export function GeneralDeleteOrganization(): ReactNode {
  useAssertPage('GeneralDeleteOrganization');
  return <OrganizationDeleteSection />;
}
