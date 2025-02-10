import React from 'react';

import { useUserProfileContext } from '../../contexts';
import { NavBar, NavbarContextProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

export const UserProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { pages } = useUserProfileContext();

  return (
    <NavbarContextProvider>
      <NavBar
        title={localizationKeys('userProfile.navbar.title')}
        description={localizationKeys('userProfile.navbar.description')}
        routes={pages.routes}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};
