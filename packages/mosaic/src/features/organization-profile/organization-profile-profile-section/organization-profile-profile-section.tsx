import type { ReactNode } from 'react';

import { useOrganizationProfileProfileSectionModel } from './organization-profile-profile-section.model';
import { OrganizationProfileProfileSectionView } from './organization-profile-profile-section.view';

export interface OrganizationProfileProfileSectionProps {
  fallback?: ReactNode;
}

export function OrganizationProfileProfileSection({ fallback }: OrganizationProfileProfileSectionProps) {
  const model = useOrganizationProfileProfileSectionModel();

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }

  const { status, organizationId, ...profile } = model;
  return (
    <OrganizationProfileProfileSectionView
      key={organizationId}
      {...profile}
    />
  );
}
