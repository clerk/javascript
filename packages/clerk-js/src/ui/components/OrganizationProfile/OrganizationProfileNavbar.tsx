import React from 'react';

import { useCoreOrganization } from '../../contexts';
import type { NavbarRoute } from '../../elements';
import { Breadcrumbs, NavBar, NavbarContextProvider, OrganizationPreview } from '../../elements';
import { CogFilled, User } from '../../icons';
import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

const organizationProfileRoutes: NavbarRoute[] = [
  {
    name: localizationKeys('organizationProfile.start.headerTitle__members'),
    id: 'members',
    icon: User,
    path: '/',
  },
  {
    name: localizationKeys('organizationProfile.start.headerTitle__settings'),
    id: 'settings',
    icon: CogFilled,
    path: 'organization-settings',
  },
];

export const OrganizationProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { organization } = useCoreOrganization();

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
        routes={organizationProfileRoutes}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};

const pageToRootNavbarRouteMap = {
  'invite-members': organizationProfileRoutes.find(r => r.id === 'members'),
  profile: organizationProfileRoutes.find(r => r.id === 'settings'),
  leave: organizationProfileRoutes.find(r => r.id === 'settings'),
};

export const OrganizationProfileBreadcrumbs = (props: Pick<PropsOfComponent<typeof Breadcrumbs>, 'title'>) => {
  return (
    <Breadcrumbs
      {...props}
      pageToRootNavbarRoute={pageToRootNavbarRouteMap}
    />
  );
};
