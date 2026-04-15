import React from 'react';

import { NavBar, NavbarContextProvider } from '@/ui/elements/Navbar';

import { localizationKeys } from '../../localization';
import type { PropsOfComponent } from '../../styledSystem';

export const ConfigureSSONavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  return (
    <NavbarContextProvider contentRef={props.contentRef}>
      <NavBar
        title={localizationKeys('configureSSO.navbar.title')}
        description={localizationKeys('configureSSO.navbar.description')}
        routes={[]}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};
