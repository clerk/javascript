import type { ReactElement } from 'react';

import { SectionSkeleton } from '../components/section-skeleton';
import { useOrganizationProfileDomainsSectionController } from './organization-profile-domains-section.controller';
import { OrganizationProfileDomainsSectionView } from './organization-profile-domains-section.view';

export function OrganizationProfileDomainsSection(): ReactElement | null {
  const controller = useOrganizationProfileDomainsSectionController();

  if (controller.status === 'loading') {
    return <SectionSkeleton />;
  }

  if (controller.status !== 'ready') {
    return null;
  }

  return (
    <OrganizationProfileDomainsSectionView
      canManage={controller.canManage}
      list={controller.list}
      enrollmentOptions={controller.enrollmentOptions}
      addVerify={controller.addVerify}
      enrollment={controller.enrollment}
      remove={controller.remove}
    />
  );
}
