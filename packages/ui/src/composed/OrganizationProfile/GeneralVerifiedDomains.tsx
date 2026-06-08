'use client';

import type { ReactNode } from 'react';

import { Protect } from '../../common';
import { OrganizationDomainsSection } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { useRequirePage } from '../useRequirePage';

export function GeneralVerifiedDomains(): ReactNode {
  if (!useRequirePage('GeneralVerifiedDomains')) return null;
  return (
    <Protect permission='org:sys_domains:read'>
      <OrganizationDomainsSection />
    </Protect>
  );
}
