import type { UserProfileModalProps, UserProfileProps } from '@clerk/types';
import React, { Suspense } from 'react';

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

// const ProgressBar = ({ value, max = 100 }: { value: number; max?: number }) => {
//   const percentage = (value / max) * 100;
//
//   const progressBarStyle = {
//     display: 'flex',
//     position: 'absolute' as const,
//     zIndex: 1,
//     top: 0,
//     left: 0,
//     alignItems: 'center',
//     width: '100%',
//     height: '20px',
//     backgroundColor: '#e0e0e0',
//     borderRadius: '10px',
//     overflow: 'hidden',
//   };
//
//   const progressStyle = {
//     width: `${percentage}%`,
//     height: '100%',
//     backgroundColor: '#4caf50',
//     transition: 'width 0.3s ease',
//   };
//
//   return (
//     <div style={progressBarStyle}>
//       <div style={progressStyle} />
//     </div>
//   );
// };

const AuthenticatedRoutes = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  return (
    <ProfileCard.Root>
      <UserProfileNavbar contentRef={contentRef}>
        <NavbarMenuButtonRow navbarTitleLocalizationKey={localizationKeys('userProfile.navbar.title')} />
        <ProfileCard.Content contentRef={contentRef}>
          <Suspense fallback={'loading'}>
            <UserProfileRoutes />
          </Suspense>
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
