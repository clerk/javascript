import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';

import type { ProfileSectionModel, UserProfileSectionData } from './profile-sections.types';

export const useUserProfileSectionModel = (): ProfileSectionModel<UserProfileSectionData> => {
  const { user } = useUser();

  if (!user) {
    return { status: 'hidden' as const };
  }

  return {
    status: 'ready' as const,
    preview: {
      name: getFullName({ firstName: user.firstName, lastName: user.lastName }),
      avatar: { firstName: user.firstName, lastName: user.lastName },
      imageUrl: user.imageUrl,
    },
  };
};
