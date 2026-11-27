import { useUser } from '@clerk/shared/react';
import React from 'react';

import type { RoutingMode } from '../../routing/use-mosaic-location';
import { profileModalOptions, useMosaicProfile } from '../profile-pages/use-mosaic-profile';
import { UserProfileSurface } from './profile';
import type { ProfileModalContentProps, ProfileModalOptions } from './profile.modal.types';

export default function ProfileModalContent({
  options,
  close,
  path,
  routing,
}: ProfileModalContentProps): React.ReactElement {
  const profile = useMosaicProfile();
  return (
    <ModalProfile
      options={options ?? profileModalOptions(profile)}
      close={close}
      path={path}
      routing={routing}
      combined
    />
  );
}

export function ModalProfile({
  options: { page: _page, ...props },
  close,
  path,
  routing,
  combined,
}: {
  options: ProfileModalOptions;
  close: () => void;
  path: string;
  routing: RoutingMode;
  combined: boolean;
}): React.ReactElement {
  const { isLoaded, user } = useUser();
  const signedOut = isLoaded && !user;

  React.useEffect(() => {
    if (signedOut) {
      close();
    }
  }, [signedOut, close]);

  return (
    <UserProfileSurface
      {...props}
      combined={combined}
      path={path}
      routing={routing}
    />
  );
}
