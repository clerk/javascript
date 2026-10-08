import { useEffect } from 'react';

import { useProtect } from '@/ui/common';
import { useRouter } from '@/ui/router';

import type { OrganizationProfileRouteGuardProps } from './organization-profile-routes.guard';

export const useOrganizationProfileRouteGuardModel = ({ kind, redirectTo }: OrganizationProfileRouteGuardProps) => {
  const allowed = useProtect(has => {
    if (kind === 'members') {
      return has({ permission: 'org:sys_memberships:read' }) || has({ permission: 'org:sys_memberships:manage' });
    }
    if (kind === 'billing') {
      return has({ permission: 'org:sys_billing:read' }) || has({ permission: 'org:sys_billing:manage' });
    }
    return has({ permission: 'org:sys_api_keys:read' }) || has({ permission: 'org:sys_api_keys:manage' });
  });
  const { navigate } = useRouter();

  useEffect(() => {
    if (!allowed && redirectTo) {
      void navigate(redirectTo);
    }
  }, [allowed, redirectTo, navigate]);

  return { allowed };
};
