import { UserProfileProps } from '@clerk/types/src';
import React from 'react';

import { Flow } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { Route, Switch } from '../../router';

const _OrganizationProfile = (_: UserProfileProps) => {
  return (
    <Flow.Root flow='organizationProfile'>
      <Flow.Part>
        <Switch>
          {/* PublicRoutes */}
          <Route path='verify'>{/*<VerificationSuccessPage />*/}</Route>
          <Route>{/*<AuthenticatedRoutes />*/}</Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

// const AuthenticatedRoutes = withCoreUserGuard(() => {
//   const contentRef = React.useRef<HTMLDivElement>(null);
//   return (
//     <UserProfileCard sx={{ height: '100%' }}>
//       <NavbarContextProvider>
//         <NavBar contentRef={contentRef} />
//         <Content ref={contentRef} />
//       </NavbarContextProvider>
//     </UserProfileCard>
//   );
// });

export const OrganizationProfile = withCardStateProvider(_OrganizationProfile);
//
// export const UserProfileModal = (props: UserProfileProps): JSX.Element => {
//   const userProfileProps: UserProfileCtx = {
//     ...props,
//     routing: 'virtual',
//     componentName: 'OrganizationProfile',
//     mode: 'modal',
//   };
//
//   return (
//     <Route path='user'>
//       <ComponentContext.Provider value={userProfileProps}>
//         {/*TODO: Used by InvisibleRootBox, can we simplify? */}
//         <div>
//           <OrganizationProfile {...userProfileProps} />
//         </div>
//       </ComponentContext.Provider>
//     </Route>
//   );
// };
