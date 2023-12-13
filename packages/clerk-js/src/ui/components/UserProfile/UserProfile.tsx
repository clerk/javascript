import type { UserProfileModalProps, UserProfileProps } from '@clerk/types';
import React from 'react';

import { withRedirectToHomeUserGuard } from '../../common';
import { ComponentContext, withCoreUserGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { ProfileCard, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';
import { mqu } from '../../styledSystem';
import type { UserProfileCtx } from '../../types';
import { UserProfileNavbar } from './UserProfileNavbar';
import { UserProfileRoutes } from './UserProfileRoutes';
import { VerificationSuccessPage } from './VerifyWithLink';

const _UserProfile = (_: UserProfileProps) => {
  return (
    <Flow.Root flow='userProfile'>
      <Flow.Part>
        <Switch>
          {/* PublicRoutes */}
          <Route path='verify'>
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
    <ProfileCard
      sx={t => ({
        display: 'grid',
        gridTemplateColumns: '1fr 2.5fr',
        [mqu.md]: {
          display: 'block',
        },
        height: t.sizes.$176,
        overflow: 'hidden',
      })}
    >
      <UserProfileNavbar contentRef={contentRef}>
        <UserProfileRoutes />
      </UserProfileNavbar>
    </ProfileCard>
  );
});

export const UserProfile = withRedirectToHomeUserGuard(withCardStateProvider(_UserProfile));

export const UserProfileModal = (props: UserProfileModalProps): JSX.Element => {
  const userProfileProps: UserProfileCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'UserProfile',
    mode: 'modal',
  };

  return (
    <Route path='user'>
      <ComponentContext.Provider value={userProfileProps}>
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <UserProfile {...userProfileProps} />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
