import { useOrganization } from '@clerk/shared/react';
import React from 'react';

import { useGate } from '../../common';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useOrganizationProfileContext } from '../../contexts';
import { Breadcrumbs, NavBar, NavbarContextProvider, OrganizationPreview } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

export const OrganizationProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { organization } = useOrganization();
  const { pages } = useOrganizationProfileContext();

  const { isAuthorizedUser: allowMembersRoute } = useGate(
    has =>
      has({
        permission: 'org:sys_memberships:read',
      }) || has({ permission: 'org:sys_memberships:manage' }),
  );

  if (!organization) {
    return null;
  }

  return (
    <NavbarContextProvider>
      <NavBar
        header={
          <OrganizationPreview
            size='sm'
            organization={organization}
            sx={t => ({ margin: `0 0 ${t.space.$4} ${t.space.$2}` })}
          />
        }
        routes={pages.routes.filter(
          r =>
            r.id !== ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS ||
            (r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS && allowMembersRoute),
        )}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};

export const OrganizationProfileBreadcrumbs = (props: Pick<PropsOfComponent<typeof Breadcrumbs>, 'title'>) => {
  const { pages } = useOrganizationProfileContext();
  return (
    <Breadcrumbs
      {...props}
      pageToRootNavbarRoute={pages.pageToRootNavbarRouteMap}
    />
  );
};
