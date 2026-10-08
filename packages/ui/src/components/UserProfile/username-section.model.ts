import { useUser } from '@clerk/shared/react';

import type { ProfileSectionModel, UsernameSectionData } from './profile-sections.types';

export type UsernameSectionProps = { isImmutable?: boolean };

export const useUsernameSectionModel = ({
  isImmutable,
}: UsernameSectionProps): ProfileSectionModel<UsernameSectionData> => {
  const { user } = useUser();

  if (!user || (isImmutable && !user.username)) {
    return { status: 'hidden' as const };
  }

  return {
    status: 'ready' as const,
    username: user.username,
    isImmutable: !!isImmutable,
  };
};
