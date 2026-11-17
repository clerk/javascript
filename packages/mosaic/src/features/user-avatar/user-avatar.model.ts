import { getFullName, getIdentifier, getInitials } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';

import type { UserAvatarData } from './user-avatar.types';

export type UserAvatarModel = { status: 'loading' } | { status: 'hidden' } | (UserAvatarData & { status: 'ready' });

export function useUserAvatarModel(): UserAvatarModel {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const name = getFullName(user) || getIdentifier(user);

  return {
    status: 'ready',
    name,
    initials: (getInitials(user) || name.charAt(0)).toUpperCase(),
    imageUrl: user.imageUrl || undefined,
  };
}
