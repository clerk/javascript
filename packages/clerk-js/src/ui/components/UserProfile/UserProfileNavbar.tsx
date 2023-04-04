import React from 'react';

import type { NavbarRoute } from '../../elements';
import { Breadcrumbs, NavBar, NavbarContextProvider } from '../../elements';
import { TickShield, User } from '../../icons';
import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

const userProfileRoutes: NavbarRoute[] = [
  {
    name: localizationKeys('userProfile.start.headerTitle__account'),
    id: 'account',
    icon: User,
    path: '/',
  },
  {
    name: localizationKeys('userProfile.start.headerTitle__security'),
    id: 'security',
    icon: TickShield,
    path: '',
  },
];

export const UserProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  return (
    <NavbarContextProvider>
      <NavBar
        routes={userProfileRoutes}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};

const pageToRootNavbarRouteMap = {
  profile: userProfileRoutes.find(r => r.id === 'account'),
  'email-address': userProfileRoutes.find(r => r.id === 'account'),
  'phone-number': userProfileRoutes.find(r => r.id === 'account'),
  'connected-account': userProfileRoutes.find(r => r.id === 'account'),
  'web3-wallet': userProfileRoutes.find(r => r.id === 'account'),
  username: userProfileRoutes.find(r => r.id === 'account'),
  'multi-factor': userProfileRoutes.find(r => r.id === 'security'),
  password: userProfileRoutes.find(r => r.id === 'security'),
  // TODO: Uncomment these lines once the issue with enabled and required password is resolved
  // 'remove-password': userProfileRoutes.find(r => r.id === 'security'),
};

export const UserProfileBreadcrumbs = (props: Pick<PropsOfComponent<typeof Breadcrumbs>, 'title'>) => {
  return (
    <Breadcrumbs
      {...props}
      pageToRootNavbarRoute={pageToRootNavbarRouteMap}
    />
  );
};
