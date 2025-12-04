import { useOrganization } from '@clerk/shared/react';
import React from 'react';

import { NavBar, NavbarContextProvider } from '@/ui/elements/Navbar';

import { useProtect } from '../../common';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useOrganizationProfileContext } from '../../contexts';
import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

export const OrganizationProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
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

  const routes = pages.routes
    .filter(
      r =>
        r.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS ||
        (r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS && allowMembersRoute),
    )
    .filter(
      r =>
        r.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.BILLING ||
        (r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.BILLING && allowBillingRoutes),
    )
    .filter(r => r.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.API_KEYS || !apiKeysProps?.hide);
  if (!organization) {
    return null;
  }

  return (
    <NavbarContextProvider contentRef={props.contentRef}>
      <NavBar
        title={localizationKeys('organizationProfile.navbar.title')}
        description={localizationKeys('organizationProfile.navbar.description')}
        routes={routes}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};
