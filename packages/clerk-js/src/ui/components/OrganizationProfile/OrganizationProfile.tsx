import { OrganizationProfileProps } from '@clerk/types';
import React from 'react';

import {
  ComponentContext,
  useCoreOrganization,
  useOrganizationProfileContext,
  withCoreUserGuard,
} from '../../contexts';
import { Flow } from '../../customizables';
import { ProfileCard, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';
import { OrganizationProfileCtx } from '../../types';
import { OrganizationProfileNavbar } from './OrganizationProfileNavbar';
import { CreateOrganizationRoutes, OrganizationProfileRoutes } from './OrganizationProfileRoutes';

const _OrganizationProfile = (_: OrganizationProfileProps) => {
  // TODO: Should this be a guard HOC?
  const { organization } = useCoreOrganization();
  const { new: isCreating } = useOrganizationProfileContext();
  if (!organization && !isCreating) {
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
  const { new: showCreateOrganization } = useOrganizationProfileContext();

  if (showCreateOrganization) {
    return (
      <ProfileCard sx={{ height: '100%' }}>
        <CreateOrganizationRoutes />
      </ProfileCard>
    );
  }

  return (
    <ProfileCard sx={{ height: '100%' }}>
      <OrganizationProfileNavbar contentRef={contentRef}>
        <OrganizationProfileRoutes contentRef={contentRef} />
      </OrganizationProfileNavbar>
    </ProfileCard>
  );
});

export const OrganizationProfile = withCardStateProvider(_OrganizationProfile);

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
