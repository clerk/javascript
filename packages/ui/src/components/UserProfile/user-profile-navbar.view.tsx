import type React from 'react';

import { NavBar, NavbarContextProvider } from '@/ui/elements/Navbar';
import { localizationKeys } from '@/ui/localization';
import type { PropsOfComponent } from '@/ui/styledSystem';

import type { UserProfileNavbarData } from './user-profile-navigation.types';

export const UserProfileNavbarView = ({
  routes,
  contentRef,
  children,
}: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'> & UserProfileNavbarData>) => (
  <NavbarContextProvider contentRef={contentRef}>
    <NavBar
      title={localizationKeys('userProfile.navbar.title')}
      description={localizationKeys('userProfile.navbar.description')}
      routes={routes}
      contentRef={contentRef}
    />
    {children}
  </NavbarContextProvider>
);
