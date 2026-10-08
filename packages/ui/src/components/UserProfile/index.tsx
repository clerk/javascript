import type { UserProfileModalProps, UserProfileProps } from '@clerk/shared/types';
import type React from 'react';
import { useRef } from 'react';

import { withCoreUserGuard } from '@/contexts';
import { withCardStateProvider } from '@/elements/contexts';
import type { WithInternalRouting } from '@/internal';

import { useUserProfileModalModel } from './user-profile-shell.model';
import { AuthenticatedUserProfileView, UserProfileModalView, UserProfileShellView } from './user-profile-shell.view';

const UserProfileInternal = () => {
  return <UserProfileShellView authenticatedRoutes={<AuthenticatedRoutes />} />;
};

const AuthenticatedRoutes = withCoreUserGuard(() => {
  const contentRef = useRef<HTMLDivElement>(null);
  return <AuthenticatedUserProfileView contentRef={contentRef} />;
});

export const UserProfile: React.ComponentType<UserProfileProps> = withCardStateProvider(UserProfileInternal);

const InternalUserProfile: React.ComponentType<WithInternalRouting<UserProfileProps>> =
  withCardStateProvider(UserProfileInternal);

export const UserProfileModal = (props: UserProfileModalProps): JSX.Element => {
  const userProfileProps = useUserProfileModalModel(props);
  return (
    <UserProfileModalView userProfileProps={userProfileProps}>
      <InternalUserProfile {...userProfileProps} />
    </UserProfileModalView>
  );
};
