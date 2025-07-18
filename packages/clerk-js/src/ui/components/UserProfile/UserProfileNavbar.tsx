import React from 'react';

import { NavBar, NavbarContextProvider } from '@/ui/elements/Navbar';

import { useUserProfileContext } from '../../contexts';
import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

export const UserProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { pages } = useUserProfileContext();

  return (
    <NavbarContextProvider contentRef={props.contentRef}>
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
