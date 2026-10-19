import { useOrganization } from '@clerk/shared/react';
import React from 'react';

import { OrganizationProfile } from './organization-profile';
import type { OrganizationProfileModalContentProps } from './organization-profile.modal.types';

export default function OrganizationProfileModalContent({
  config,
  payload,
  close,
}: OrganizationProfileModalContentProps): React.ReactElement {
  const { isLoaded, organization } = useOrganization();
  const noOrganization = isLoaded && !organization;

  React.useEffect(() => {
    if (noOrganization) {
      close();
    }
  }, [noOrganization, close]);

  return (
    <OrganizationProfile
      {...config}
      defaultPage={payload?.page}
    />
  );
}
