import { UserProfileProps } from '@clerk/types/src';
import React from 'react';
import { UserProfileCtx } from 'ui/types';

import { ComponentContext, withCoreUserGuard } from '../../ui/contexts';
import { Route, Switch } from '../../ui/router';
import { Flow } from '../customizables';
import { UserProfileCard, withCardStateProvider } from '../elements';
import { Content } from './Content';
import { NavBar, NavbarContextProvider } from './Navbar';
import { VerificationSuccessPage } from './VerifyWithLink';

const _UserProfile = (_: UserProfileProps) => {
  return (
    <Flow.Root flow='userProfile'>
      <Flow.Part>
        <Switch>
          {/* PublicRoutes */}
          <Route path={'verify'}>
            <VerificationSuccessPage />
          </Route>
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
    <UserProfileCard sx={{ height: '100%' }}>
      <NavbarContextProvider>
        <NavBar contentRef={contentRef} />
        <Content ref={contentRef} />
      </NavbarContextProvider>
    </UserProfileCard>
  );
});

export const UserProfile = withCardStateProvider(_UserProfile);

export const UserProfileModal = (props: UserProfileProps): JSX.Element => {
  const userProfileProps: UserProfileCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'UserProfile',
    mode: 'modal',
  };

  return (
    <Route path='user'>
      <ComponentContext.Provider value={userProfileProps}>
        <UserProfile {...userProfileProps} />
      </ComponentContext.Provider>
    </Route>
  );
};
