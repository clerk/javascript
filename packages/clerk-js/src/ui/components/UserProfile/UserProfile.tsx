import type { UserProfileModalProps, UserProfileProps } from '@clerk/types';
import React from 'react';

import { USER_PROFILE_CARD_SCROLLBOX_ID } from '../../constants';
import { UserProfileContext, withCoreUserGuard } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { NavbarMenuButtonRow, ProfileCard, withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';
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
    <ProfileCard.Root>
      <UserProfileNavbar contentRef={contentRef}>
        <NavbarMenuButtonRow navbarTitleLocalizationKey={localizationKeys('userProfile.navbar.title')} />
        <ProfileCard.Content
          contentRef={contentRef}
          scrollBoxId={USER_PROFILE_CARD_SCROLLBOX_ID}
        >
          <UserProfileRoutes />
        </ProfileCard.Content>
      </UserProfileNavbar>
    </ProfileCard.Root>
  );
});

export const UserProfile = withCardStateProvider(_UserProfile);

export const UserProfileModal = (props: UserProfileModalProps): JSX.Element => {
  const userProfileProps: UserProfileCtx = {
    ...props,
    routing: 'virtual',
    componentName: 'UserProfile',
    mode: 'modal',
  };

  return (
    <Route path='user'>
      <UserProfileContext.Provider value={userProfileProps}>
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <UserProfile {...userProfileProps} />
        </div>
      </UserProfileContext.Provider>
    </Route>
  );
};
