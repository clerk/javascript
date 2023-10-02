import React from 'react';

import { useUserProfileContext } from '../../contexts';
import { Breadcrumbs, NavBar, NavbarContextProvider } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

export const UserProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { pages } = useUserProfileContext();
  return (
    <NavbarContextProvider>
      <NavBar
        routes={pages.routes}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};

export const UserProfileBreadcrumbs = (props: Pick<PropsOfComponent<typeof Breadcrumbs>, 'title'>) => {
  const { pages } = useUserProfileContext();
  return (
    <Breadcrumbs
      {...props}
      pageToRootNavbarRoute={pages.pageToRootNavbarRouteMap}
    />
  );
};
