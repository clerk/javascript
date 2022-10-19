import React from 'react';

import { Breadcrumbs, NavBar, NavbarContextProvider, NavbarRoute, OrganizationPreview } from '../../elements';
import { CogFilled, User } from '../../icons';
import { localizationKeys } from '../../localization';
import { PropsOfComponent } from '../../styledSystem';

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
  return (
    <NavbarContextProvider>
      <NavBar
        header={
          <OrganizationPreview
            size='sm'
            organization={{
              name: 'Drivepoint',
              logoUrl: 'https://images.lclclerk.com/uploaded/img_2GE5fixIVWTNMdRjcH7ivtelSxT.png',
            }}
            sx={t => ({ margin: `0 0 ${t.space.$2x5} ${t.space.$2}` })}
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
};

export const OrganizationProfileBreadcrumbs = (props: Pick<PropsOfComponent<typeof Breadcrumbs>, 'title'>) => {
  return (
    <Breadcrumbs
      {...props}
      pageToRootNavbarRoute={pageToRootNavbarRouteMap}
    />
  );
};
