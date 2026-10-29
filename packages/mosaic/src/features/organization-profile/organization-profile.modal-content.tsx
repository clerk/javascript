import { useOrganization } from '@clerk/shared/react';
import React from 'react';

import { OrganizationProfile } from './organization-profile';
import type { OrganizationProfileModalContentProps } from './organization-profile.modal.types';

export default function OrganizationProfileModalContent({
  options,
  close,
}: OrganizationProfileModalContentProps): React.ReactElement {
  const { isLoaded, organization } = useOrganization();
  const inactive = isLoaded && !organization;

  React.useEffect(() => {
    if (inactive) {
      close();
    }
  }, [inactive, close]);

  const { page, ...props } = options ?? {};
  return (
    <OrganizationProfile
      {...props}
      defaultPage={page}
    />
  );
}
