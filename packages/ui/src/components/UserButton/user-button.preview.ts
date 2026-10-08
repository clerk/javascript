import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import type { UserResource } from '@clerk/shared/types';

import type { UserButtonPreviewData } from './multisession.types';

export const toUserButtonPreview = (user: UserResource | null | undefined): UserButtonPreviewData | undefined => {
  if (!user) {
    return undefined;
  }

  const name = getFullName(user);
  const identifier = getIdentifier(user);

  return {
    name,
    identifier,
    imageUrl: user.imageUrl,
    avatar: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    title: name || identifier,
    subtitle: name && identifier ? identifier : undefined,
  };
};
