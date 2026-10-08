import { useUser } from '@clerk/shared/react';

import type { PasswordSectionData, ProfileSectionModel } from './profile-sections.types';

export const usePasswordSectionModel = (): ProfileSectionModel<PasswordSectionData> => {
  const { user } = useUser();
  if (!user) {
    return { status: 'hidden' as const };
  }
  return { status: 'ready' as const, passwordEnabled: user.passwordEnabled };
};
