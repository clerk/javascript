import { useOrganization } from '@clerk/shared/react';
import type { OrganizationProfileModalProps, OrganizationProfileProps } from '@clerk/types';
import React from 'react';

import { withOrganizationsEnabledGuard } from '../../common';
import { ComponentContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { ProfileCard, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';
import type { OrganizationProfileCtx } from '../../types';
import { OrganizationProfileNavbar } from './OrganizationProfileNavbar';
import { OrganizationProfileRoutes } from './OrganizationProfileRoutes';

const _OrganizationProfile = (_: OrganizationProfileProps) => {
  const { organization } = useOrganization();

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
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <OrganizationProfileNavbar contentRef={contentRef}>
        <ProfileCard.Content contentRef={contentRef}>
          <OrganizationProfileRoutes />
        </ProfileCard.Content>
      </OrganizationProfileNavbar>
    </ProfileCard.Root>
  );
});

export const OrganizationProfile = withOrganizationsEnabledGuard(
  withCardStateProvider(_OrganizationProfile),
  'OrganizationProfile',
  {
    mode: 'redirect',
  },
);

export const OrganizationProfileModal = (props: OrganizationProfileModalProps): JSX.Element => {
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
