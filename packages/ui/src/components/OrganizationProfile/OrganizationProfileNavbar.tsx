import type React from 'react';

import type { NavBar } from '@/ui/elements/Navbar';
import type { PropsOfComponent } from '@/ui/styledSystem';

import { useOrganizationProfileNavbarModel } from './organization-profile-navbar.model';
import { OrganizationProfileNavbarView } from './organization-profile-navbar.view';

export const OrganizationProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const model = useOrganizationProfileNavbarModel();

  if (!model.hasOrganization) {
    return null;
  }

  return (
    <OrganizationProfileNavbarView
      routes={model.routes}
      contentRef={props.contentRef}
    >
      {props.children}
    </OrganizationProfileNavbarView>
  );
};
