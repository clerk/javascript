import type { OrganizationProfileProps } from '@clerk/types';
import React from 'react';

import { withOrganizationsEnabledGuard, withRedirectToHomeOrganizationGuard } from '../../common';
import { ComponentContext, useCoreOrganization, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { ProfileCard, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';
import type { OrganizationProfileCtx } from '../../types';
import { OrganizationProfileNavbar } from './OrganizationProfileNavbar';
import { OrganizationProfileRoutes } from './OrganizationProfileRoutes';

const _OrganizationProfile = (_: OrganizationProfileProps) => {
  // TODO: Should this be a guard HOC?
  const { organization } = useCoreOrganization();

  if (!organization) {
    return null;
  }

  return (
    <Flow.Root flow='organizationProfile'>
      <Flow.Part>
        <Switch>
          <Route>
            <AuthenticatedRoutes />
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

const AuthenticatedRoutes = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  return (
    <ProfileCard sx={{ height: '100%' }}>
      <OrganizationProfileNavbar contentRef={contentRef}>
        <OrganizationProfileRoutes contentRef={contentRef} />
      </OrganizationProfileNavbar>
    </ProfileCard>
  );
});

export const OrganizationProfile = withRedirectToHomeOrganizationGuard(
  withOrganizationsEnabledGuard(withCardStateProvider(_OrganizationProfile), 'OrganizationProfile', {
    mode: 'redirect',
  }),
);

export const OrganizationProfileModal = (props: OrganizationProfileProps): JSX.Element => {
  const organizationProfileProps: OrganizationProfileCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'OrganizationProfile',
    mode: 'modal',
  };

  return (
    <Route path='organizationProfile'>
      <ComponentContext.Provider value={organizationProfileProps}>
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <OrganizationProfile {...organizationProfileProps} />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
