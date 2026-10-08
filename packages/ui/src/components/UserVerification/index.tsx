import type { __internal_UserVerificationModalProps, __internal_UserVerificationProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreSessionSwitchGuard } from '@/contexts';
import type { WithInternalRouting } from '@/internal';

import { UserVerificationModalView, UserVerificationRoutesView } from './user-verification-routes.view';
import { UserVerificationSessionProvider } from './user-verification-session.model';

function UserVerificationRoutes(): JSX.Element {
  return (
    <UserVerificationSessionProvider>
      <UserVerificationRoutesView />
    </UserVerificationSessionProvider>
  );
}

UserVerificationRoutes.displayName = 'UserVerification';

const UserVerification: React.ComponentType<WithInternalRouting<__internal_UserVerificationProps>> =
  withCoreSessionSwitchGuard(UserVerificationRoutes);

const UserVerificationModal = (props: __internal_UserVerificationModalProps): JSX.Element => (
  <UserVerificationModalView
    props={props}
    userVerification={
      <UserVerification
        {...props}
        routing='virtual'
      />
    }
  />
);

export { UserVerification, UserVerificationModal };
