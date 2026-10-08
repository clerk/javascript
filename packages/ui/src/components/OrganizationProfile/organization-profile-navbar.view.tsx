import type React from 'react';

import { NavBar, NavbarContextProvider } from '@/ui/elements/Navbar';
import { localizationKeys } from '@/ui/localization';
import type { PropsOfComponent } from '@/ui/styledSystem';

import type { OrganizationProfileNavbarData } from './organization-navigation.types';

export const OrganizationProfileNavbarView = ({
  routes,
  contentRef,
  children,
}: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'> & OrganizationProfileNavbarData>) => (
  <NavbarContextProvider contentRef={contentRef}>
    <NavBar
      title={localizationKeys('organizationProfile.navbar.title')}
      description={localizationKeys('organizationProfile.navbar.description')}
      routes={routes}
      contentRef={contentRef}
    />
    {children}
  </NavbarContextProvider>
);
