import { useContext } from 'react';

import { Protect } from '../../common';
import {
  OrganizationDeleteSection,
  OrganizationDomainsSection,
  OrganizationLeaveSection,
  OrganizationProfileSection,
} from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { PageContext } from '../PageContext';

function useRequirePage(componentName: string): boolean {
  const page = useContext(PageContext);
  if (!page) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`${componentName} must be used inside a page component (e.g. OrganizationProfile.General)`);
    }
    return false;
  }
  return true;
}

export function GeneralOrganizationProfile() {
  if (!useRequirePage('GeneralOrganizationProfile')) return null;
  return <OrganizationProfileSection />;
}

export function GeneralVerifiedDomains() {
  if (!useRequirePage('GeneralVerifiedDomains')) return null;
  return (
    <Protect permission='org:sys_domains:read'>
      <OrganizationDomainsSection />
    </Protect>
  );
}

export function GeneralLeaveOrganization() {
  if (!useRequirePage('GeneralLeaveOrganization')) return null;
  return <OrganizationLeaveSection />;
}

export function GeneralDeleteOrganization() {
  if (!useRequirePage('GeneralDeleteOrganization')) return null;
  return <OrganizationDeleteSection />;
}
