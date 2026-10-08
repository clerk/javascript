import type React from 'react';

import type { NavBar } from '@/ui/elements/Navbar';
import type { PropsOfComponent } from '@/ui/styledSystem';

import { useUserProfileNavbarModel } from './user-profile-navbar.model';
import { UserProfileNavbarView } from './user-profile-navbar.view';

export const UserProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const model = useUserProfileNavbarModel();

  return (
    <UserProfileNavbarView
      routes={model.routes}
      contentRef={props.contentRef}
    >
      {props.children}
    </UserProfileNavbarView>
  );
};
