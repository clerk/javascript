import { useOrganization } from '@clerk/shared/react';

import { useProtect } from '@/ui/common';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '@/ui/constants';
import { useOrganizationProfileContext } from '@/ui/contexts';

import type { OrganizationProfileNavbarModel } from './organization-navigation.types';
import { useSecurityRouteAccess } from './useSecurityRouteAccess';

export const useOrganizationProfileNavbarModel = (): OrganizationProfileNavbarModel => {
  const { organization } = useOrganization();
  const { apiKeysProps, pages } = useOrganizationProfileContext();

  const allowMembersRoute = useProtect(
    has =>
      has({
        permission: 'org:sys_memberships:read',
      }) || has({ permission: 'org:sys_memberships:manage' }),
  );

  const allowBillingRoutes = useProtect(
    has =>
      has({
        permission: 'org:sys_billing:read',
      }) || has({ permission: 'org:sys_billing:manage' }),
  );

  const { allowed: allowSecurityRoute } = useSecurityRouteAccess();

  const routes = pages.routes
    .filter(
      route =>
        route.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS ||
        (route.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS && allowMembersRoute),
    )
    .filter(
      route =>
        route.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.BILLING ||
        (route.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.BILLING && allowBillingRoutes),
    )
    .filter(route => route.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.API_KEYS || !apiKeysProps?.hide)
    .filter(
      route =>
        route.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.SECURITY ||
        (route.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.SECURITY && allowSecurityRoute),
    );

  return { hasOrganization: Boolean(organization), routes };
};
