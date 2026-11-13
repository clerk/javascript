import type React from 'react';

import { ModalProfile } from '../profile/profile.modal-content';
import { useMosaicProfile, userProfileModalOptions } from '../profile-pages/use-mosaic-profile';
import type { UserProfileModalContentProps } from './user-profile.modal.types';

export default function UserProfileModalContent({
  options,
  close,
  path,
}: UserProfileModalContentProps): React.ReactElement {
  const profile = useMosaicProfile();
  // An opening the routing state caused on its own, a deep link or a return, carries no options;
  // it gets the provider's, the same ones every handle-driven open spreads in.
  return (
    <ModalProfile
      options={options ?? userProfileModalOptions(profile)}
      close={close}
      path={path}
      combined={false}
    />
  );
}
