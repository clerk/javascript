import { useUser } from '@clerk/shared/react';
import React from 'react';

import { useMosaicProfile, userProfileModalOptions } from '../profile-pages/use-mosaic-profile';
import { UserProfileSurface } from './user-profile';
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
  const provided: UserProfileModalOptions = userProfileModalOptions(profile);
  const { page: _page, ...props } = options ?? provided;
  return (
    <UserProfileSurface
      {...props}
      presentation='modal'
      path={path}
    />
  );
}
