import React from 'react';

import { NavBar, NavbarContextProvider } from '@/ui/elements/Navbar';

import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useUserProfileContext } from '../../contexts';
import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

export const UserProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { pages, apiKeysProps } = useUserProfileContext();

  const routes = pages.routes.filter(r => r.id !== USER_PROFILE_NAVBAR_ROUTE_ID.API_KEYS || !apiKeysProps?.hide);

  return (
    <NavbarContextProvider contentRef={props.contentRef}>
      <NavBar
        title={localizationKeys('userProfile.navbar.title')}
        description={localizationKeys('userProfile.navbar.description')}
        routes={routes}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};
