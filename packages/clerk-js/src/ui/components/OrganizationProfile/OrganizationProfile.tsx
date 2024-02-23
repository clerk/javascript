import { useOrganization } from '@clerk/shared/react';
import type { OrganizationProfileModalProps, OrganizationProfileProps } from '@clerk/types';
import React from 'react';

import { withOrganizationsEnabledGuard } from '../../common';
import { ComponentContext, withCoreUserGuard } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { Animated, NavbarMenuButtonRow, ProfileCard, withCardStateProvider } from '../../elements';
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
      <Animated asChild>
        <ProfileCard.Root>
          <Switch>
            <Route>
              <AuthenticatedRoutes />
            </Route>
          </Switch>
        </ProfileCard.Root>
      </Animated>
    </Flow.Root>
  );
};

const AuthenticatedRoutes = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  return (
    <OrganizationProfileNavbar contentRef={contentRef}>
      <NavbarMenuButtonRow navbarTitleLocalizationKey={localizationKeys('organizationProfile.navbar.title')} />
      <ProfileCard.Content contentRef={contentRef}>
        <OrganizationProfileRoutes />
      </ProfileCard.Content>
    </OrganizationProfileNavbar>
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
