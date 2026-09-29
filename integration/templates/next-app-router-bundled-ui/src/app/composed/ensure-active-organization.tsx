'use client';

import { useClerk, useOrganization, useOrganizationList } from '@clerk/nextjs';
import { useEffect } from 'react';

export function EnsureActiveOrganization() {
  const { setActive } = useClerk();
  const { organization } = useOrganization();
  const { isLoaded, userMemberships } = useOrganizationList({ userMemberships: true });

  useEffect(() => {
    if (!isLoaded || organization) return;
    const first = userMemberships?.data?.[0]?.organization;
    if (first && setActive) {
      void setActive({ organization: first.id });
    }
  }, [isLoaded, organization, userMemberships, setActive]);

  return null;
}
