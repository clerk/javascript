import { useUser } from '@clerk/shared/react';
import React from 'react';

import { UserProfile } from './user-profile';
import type { UserProfileModalContentProps } from './user-profile.modal.types';

export default function UserProfileModalContent({ options, close }: UserProfileModalContentProps): React.ReactElement {
  const { isLoaded, user } = useUser();
  const signedOut = isLoaded && !user;

  React.useEffect(() => {
    if (signedOut) {
      close();
    }
  }, [signedOut, close]);

  const { page, ...props } = options ?? {};
  return (
    <UserProfile
      {...props}
      defaultPage={page}
    />
  );
}
