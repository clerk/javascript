'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { useOrganizationProfileModel } from './organization-profile.model';
import type { OrganizationProfileOptions } from './organization-profile.provider';
import { OrganizationProfileProvider } from './organization-profile.provider';
import type { OrganizationProfileViewProps } from './organization-profile.view';
import { OrganizationProfileView } from './organization-profile.view';
import { OrganizationProfileApiKeysPanel } from './organization-profile-api-keys-panel';
import { OrganizationProfileGeneralPanel } from './organization-profile-general-panel';
import { OrganizationProfileMembersPanel } from './organization-profile-members-panel';

export interface OrganizationProfileProps
  extends
    Pick<OrganizationProfileViewProps, 'customPages' | 'pageOrder'>,
    Pick<OrganizationProfileOptions, 'afterLeaveOrganizationUrl'> {
  defaultPage?: OrganizationProfileViewProps['activePage'];
  fallback?: ReactNode;
}

export function OrganizationProfile({
  customPages,
  pageOrder,
  defaultPage,
  afterLeaveOrganizationUrl,
  fallback,
}: OrganizationProfileProps) {
  const model = useOrganizationProfileModel();
  const [activePage, setActivePage] = useState<OrganizationProfileViewProps['activePage']>(
    defaultPage ?? pageOrder?.[0] ?? 'general',
  );

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }

  return (
    <OrganizationProfileProvider afterLeaveOrganizationUrl={afterLeaveOrganizationUrl}>
      <OrganizationProfileView
        elevation='flush'
        activePage={activePage}
        onPageChange={setActivePage}
        customPages={customPages}
        pageOrder={pageOrder}
        pages={{
          general: <OrganizationProfileGeneralPanel />,
          members: model.pages.includes('members') ? <OrganizationProfileMembersPanel /> : undefined,
          apiKeys: model.pages.includes('apiKeys') ? <OrganizationProfileApiKeysPanel /> : undefined,
        }}
      />
    </OrganizationProfileProvider>
  );
}
