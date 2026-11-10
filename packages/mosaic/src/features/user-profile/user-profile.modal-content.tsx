import { useUser } from '@clerk/shared/react';
import React from 'react';

import { UserProfileSurface } from '../profile/profile';
import { useMosaicProfile, userProfileModalOptions } from '../profile-pages/use-mosaic-profile';
import type { UserProfileModalContentProps, UserProfileModalOptions } from './user-profile.modal.types';

export default function UserProfileModalContent({
  options,
  close,
  path,
}: UserProfileModalContentProps): React.ReactElement {
  const { isLoaded, user } = useUser();
  const profile = useMosaicProfile();
  const signedOut = isLoaded && !user;

  React.useEffect(() => {
    if (signedOut) {
      close();
    }
  }, [signedOut, close]);

  // An opening the routing state caused on its own, a deep link or a return, carries no options;
  // it gets the provider's, the same ones every handle-driven open spreads in.
  const resolved: UserProfileModalOptions = options ?? userProfileModalOptions(profile);
  const { page: _page, combined = true, ...props } = resolved;
  return (
    <UserProfileSurface
      {...props}
      combined={combined}
      presentation='modal'
      path={path}
    />
  );
}
