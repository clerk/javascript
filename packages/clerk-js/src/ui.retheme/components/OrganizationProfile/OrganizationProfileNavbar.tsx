import React from 'react';

import { useCoreOrganization, useOrganizationProfileContext } from '../../contexts';
import { Breadcrumbs, NavBar, NavbarContextProvider, OrganizationPreview } from '../../elements';
import type { PropsOfComponent } from '../../styledSystem';

export const OrganizationProfileNavbar = (
  props: React.PropsWithChildren<Pick<PropsOfComponent<typeof NavBar>, 'contentRef'>>,
) => {
  const { organization } = useCoreOrganization();
  const { pages } = useOrganizationProfileContext();

  if (!organization) {
    return null;
  }

  return (
    <NavbarContextProvider>
      <NavBar
        header={
          <OrganizationPreview
            size='sm'
            organization={organization}
            sx={t => ({ margin: `0 0 ${t.space.$4} ${t.space.$2}` })}
          />
        }
        routes={pages.routes}
        contentRef={props.contentRef}
      />
      {props.children}
    </NavbarContextProvider>
  );
};

export const OrganizationProfileBreadcrumbs = (props: Pick<PropsOfComponent<typeof Breadcrumbs>, 'title'>) => {
  const { pages } = useOrganizationProfileContext();
  return (
    <Breadcrumbs
      {...props}
      pageToRootNavbarRoute={pages.pageToRootNavbarRouteMap}
    />
  );
};
