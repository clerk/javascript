import React from 'react';

import { USER_PROFILE_NAVBAR_ROUTE_ID } from '../../constants';
import { useEnvironment, useUserProfileContext } from '../../contexts';
import { NavBar, NavbarContextProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

export const UserProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { pages } = useUserProfileContext();
  const { billing } = useEnvironment().userSettings;

  const routes = pages.routes.filter(r => !(r.id === USER_PROFILE_NAVBAR_ROUTE_ID.BILLING && !billing?.enabled));

  return (
    <NavbarContextProvider>
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
